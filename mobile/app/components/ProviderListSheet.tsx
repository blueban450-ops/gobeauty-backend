import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, PanResponder, Animated, Image, TouchableOpacity } from 'react-native';
// Make sure ye path sahi ho jahan aapne File 2 save ki hai
import ProviderListCard from './ProviderListCard';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7; // Screen ka 70%
const SHEET_MIN_HEIGHT = 140; // Itna hissa hamesha dikhega


// Controlled: open, onOpen, onClose
export default function ProviderListSheet({ providers, open = false, onOpen, onClose, onProviderPress }) {
    // If open=false, sheet is closed (peek); if open=true, sheet is open (full)
    const closedPosition = SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT;
    const translateY = useRef(new Animated.Value(open ? 0 : closedPosition)).current;
    const lastOffset = useRef(open ? 0 : closedPosition);
    const [isOpen, setIsOpen] = useState(!!open);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
            onPanResponderMove: (_, gesture) => {
                let newY = lastOffset.current + gesture.dy;
                if (newY < 0) newY = 0;
                if (newY > closedPosition) newY = closedPosition;
                translateY.setValue(newY);
            },
            onPanResponderRelease: (_, gesture) => {
                let newY = lastOffset.current + gesture.dy;
                if (gesture.dy < -50 || newY < closedPosition / 2) {
                    // Open (Upar)
                    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
                    lastOffset.current = 0;
                    setIsOpen(true);
                    if (onOpen) onOpen();
                } else {
                    // Close (Neeche/Peek)
                    Animated.spring(translateY, { toValue: closedPosition, useNativeDriver: true }).start();
                    lastOffset.current = closedPosition;
                    setIsOpen(false);
                    if (onClose) onClose();
                }
            },
        })
    ).current;

    // Sync with open prop
    useEffect(() => {
        if (open) {
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
            lastOffset.current = 0;
            setIsOpen(true);
        } else {
            Animated.spring(translateY, { toValue: closedPosition, useNativeDriver: true }).start();
            lastOffset.current = closedPosition;
            setIsOpen(false);
        }
    }, [open]);



    // Full width vertical card with image on top
    // Fade-in effect as a separate component
    const FadeInProviderCard = ({ item, index }) => {
        const fadeAnim = React.useRef(new Animated.Value(0)).current;
        React.useEffect(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }).start();
        }, []);
        return (
            <TouchableOpacity
                style={styles.fullCard}
                activeOpacity={0.85}
                onPress={() => onProviderPress && onProviderPress(item)}
            >
                {item.avatar ? (
                    <Animated.Image source={{ uri: item.avatar }} style={[styles.fullImage, { opacity: fadeAnim }]} />
                ) : (
                    <View style={styles.fullImagePlaceholder} />
                )}
                <View style={styles.fullInfo}>
                    <Text style={styles.fullName} numberOfLines={1}>{item.name || 'Unknown Provider'}</Text>
                    <Text style={styles.fullService} numberOfLines={1}>{(item.services && item.services[0]?.customName) || (item.services && item.services[0]?.serviceId?.name) || 'Service'}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Empty state message in Roman Urdu
    const renderEmpty = () => (
        <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ color: '#ec4899', fontSize: 16, textAlign: 'center' }}>
                {'No providers found in this category.'}
            </Text>
        </View>
    );

    return (
        <Animated.View
            style={[styles.sheet, { transform: [{ translateY }] }]}
            {...panResponder.panHandlers}
        >
            {/* Handle Bar */}
            <View style={styles.handleContainer}>
                <View style={styles.handle} />
                <Text style={styles.headerText}>
                    {isOpen ? 'Swipe down to close' : 'Swipe up for providers'}
                </Text>
            </View>

            {/* List: only show when open, vertical full-width image cards */}
            {isOpen && (
                <FlatList
                    data={providers}
                    keyExtractor={(item, index) => item._id || item.id || index.toString()}
                    renderItem={({ item, index }) => <FadeInProviderCard item={item} index={index} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 24, paddingTop: 8 }}
                    ListEmptyComponent={renderEmpty}
                />
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0, // Tab bar ke upar dikhane ke liye
        height: SHEET_MAX_HEIGHT,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 20,
        zIndex: 999,
    },
    fullCard: {
        width: '100%',
        backgroundColor: '#fff',
        marginBottom: 18,
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    fullImage: {
        width: '100%',
        height: 170,
        resizeMode: 'cover',
        backgroundColor: '#e2e8f0',
    },
    fullImagePlaceholder: {
        width: '100%',
        height: 170,
        backgroundColor: '#e2e8f0',
    },
    fullInfo: {
        padding: 14,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    fullName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#22223b',
        marginBottom: 2,
    },
    fullService: {
        fontSize: 14,
        color: '#6c757d',
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#cbd5e1',
        marginBottom: 6,
    },
    headerText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600'
    }
});
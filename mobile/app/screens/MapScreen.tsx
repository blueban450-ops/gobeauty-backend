 import React, { useEffect, useState, useRef, useMemo } from 'react';

import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Image, ScrollView, PanResponder, Animated, Easing } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './BookingScreen';

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import ClusteredMapView from 'react-native-map-clustering';

import * as Location from 'expo-location';



// Make sure these paths exist in your project

import api from '../lib/api';

import SearchBar from '../components/SearchBar';

import ProviderListSheet from '../components/ProviderListSheet';



// ================= MAP STYLES =================



// 1. STANDARD (Default Google Colors - Colorful)

const styleStandard = [];



// 2. PINKISH (Soft Rose Style)

const stylePinkish = [

  { "elementType": "geometry", "stylers": [{ "color": "#fff1f2" }] },

  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },

  { "elementType": "labels.text.fill", "stylers": [{ "color": "#881337" }] },

  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#fff1f2" }] },

  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#9d174d" }] },

  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },

  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#ffe4e6" }] },

  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },

  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#fce7f3" }] },

  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e5e7eb" }] }

];



// 3. SLEEK GREY (Your Blackish Grey Style)

const styleGrey = [

  { "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },

  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },

  { "elementType": "labels.text.fill", "stylers": [{ "color": "#424242" }] },

  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }] },

  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#212121" }] },

  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#dbdbdb" }] },

  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#d0d0d0" }] },

  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },

  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },

  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#c2c2c2" }] },

  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#a3a3a3" }] },

  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#e0e0e0" }] }

];



// Combine Styles into an Array

const MAP_THEMES = [

  { name: 'Standard', style: styleStandard, indicatorColor: '#4285F4' }, // Index 0: Top

  { name: 'Pinkish', style: stylePinkish, indicatorColor: '#ec4899' },  // Index 1: Middle

  { name: 'Grey', style: styleGrey, indicatorColor: '#424242' }         // Index 2: Bottom

];





const MapScreen = () => {

  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'ProviderDetail'>>();

  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(true);

  const [locationError, setLocationError] = useState('');

  const mapRef = useRef(null);

  const [providers, setProviders] = useState([]);

  const [search, setSearch] = useState('');

  const [sheetOpen, setSheetOpen] = useState(false);

  const [categories, setCategories] = useState([]);

  const [catLoading, setCatLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('');

  // --- THEME STATE & ANIMATION ---

  const [themeIndex, setThemeIndex] = useState(2); // Start with Grey (Index 2)

  // Animation Value for the Dot Position (Y-axis)

  // Height of bar is 120 approx. Steps: 0 (Top), 50 (Mid), 100 (Bot)

  const dotAnimation = useRef(new Animated.Value(100)).current;



  // Debugging ke liye

  useEffect(() => {

    console.log('LOCATION:', location);

    console.log('LOCATION ERROR:', locationError);

  }, [location, locationError]);



  useEffect(() => {

    // Animate Dot whenever themeIndex changes

    let targetValue = 0;

    if (themeIndex === 0) targetValue = 0;    // Top

    if (themeIndex === 1) targetValue = 50;   // Middle

    if (themeIndex === 2) targetValue = 100;  // Bottom



    Animated.spring(dotAnimation, {

      toValue: targetValue,

      useNativeDriver: true,

      friction: 8,

      tension: 50

    }).start();

  }, [themeIndex]);



  // --- PAN RESPONDER (SWIPE LOGIC) ---

  const panResponder = useRef(

    PanResponder.create({

      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: () => true,

      onPanResponderRelease: (evt, gestureState) => {

        // Detect Swipe Up (Negative DY)

        if (gestureState.dy < -20) {

          setThemeIndex(prev => Math.max(0, prev - 1)); // Go Up (0 is max top)

        }

        // Detect Swipe Down (Positive DY)

        else if (gestureState.dy > 20) {

          setThemeIndex(prev => Math.min(2, prev + 1)); // Go Down (2 is max bottom)

        }

      },

    })

  ).current;



  // 1. Fetch Categories

  useEffect(() => {

    const fetchCategories = async () => {

      setCatLoading(true);

      try {

        const res = await api.get('/categories');

        setCategories(Array.isArray(res.data) ? res.data : res.data?.categories || []);

      } catch (e) {

        setCategories([]);

      } finally {

        setCatLoading(false);

      }

    };

    fetchCategories();

  }, []);



  // 2. Fetch Providers

  useEffect(() => {

    const fetchProviders = async () => {

      try {

        const res = await api.get('/providers?limit=100');

        setProviders(res.data.providers || []);

      } catch (e) {

        setProviders([]);

      }

    };

    fetchProviders();

  }, []);



  // 3. Get User Location

  useEffect(() => {

    (async () => {

      try {

        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {

          setLocationError('Location ki permission nahi mili. Barah-e-karam app ki settings se location allow karein.');

          setLoading(false);

          return;

        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });

        if (!loc?.coords?.latitude || !loc?.coords?.longitude) {

          setLocationError('Location mil nahi rahi. Dobara koshish karein ya GPS on karein.');

        } else {

          setLocation({

            latitude: loc.coords.latitude,

            longitude: loc.coords.longitude,

          });

        }

      } catch (e) {

        setLocationError('Location fetch karte hue masla aaya. Internet ya GPS check karein.');

        setLoading(false);

      } finally {

        setLoading(false);

      }

    })();

  }, []);



  // Filter Logic (Memoized to prevent flickering)

  const filteredProviders = useMemo(() => {

    return providers.filter(p => {

      // Category filter: provider must have at least one service with matching categoryId

      if (selectedCategory) {

        const hasMatchingService = Array.isArray(p.services) && p.services.some(s => {

          if (s.serviceId && typeof s.serviceId === 'object') {

            return s.serviceId.categoryId === selectedCategory;

          }

          return false;

        });

        if (!hasMatchingService) return false;

      }

      // Search filter

      if (search && search.trim()) {

        const searchText = search.trim().toLowerCase();

        const hasName = p.name && p.name.toLowerCase().includes(searchText);

        const hasService = Array.isArray(p.services) && p.services.some((s) => {

          let sName = '';

          if (typeof s.customName === 'string') sName = s.customName;

          else if (s.serviceId?.name) sName = s.serviceId.name;

          else if (typeof s.serviceId === 'string') sName = s.serviceId;

          return sName.toLowerCase().includes(searchText);

        });

        return hasName || hasService;

      }

      return true;

    });

  }, [providers, search, selectedCategory]);





  if (loading) {

    return <View style={styles.container}><ActivityIndicator size="large" color="#ec4899" /></View>;

  }



  if (locationError) {

    return (

      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>

        <Text style={{ color: '#ec4899', fontSize: 18, textAlign: 'center', margin: 20 }}>{locationError}</Text>

      </View>

    );

  }



  // Region ko safe check karo

  let region;

  if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {

    region = {

      latitude: location.latitude,

      longitude: location.longitude,

      latitudeDelta: 0.01,

      longitudeDelta: 0.01,

    };

  } else {

    region = {

      latitude: 24.8607,

      longitude: 67.0011,

      latitudeDelta: 0.09,

      longitudeDelta: 0.04,

    };

  }



  return (

    <View style={styles.container}>

      {/* --- MAP COMPONENT --- */}

      <ClusteredMapView

        ref={mapRef}

        provider={PROVIDER_GOOGLE}

        // DYNAMIC STYLE HERE based on state

        customMapStyle={MAP_THEMES[themeIndex].style}

        style={styles.map2025}

        region={region}

        initialRegion={region}

        showsUserLocation={true}

        mapPadding={{ top: 160, right: 0, bottom: 0, left: 0 }}

        clusterColor="#ec4899"

        clusterTextColor="#fff"

        animationEnabled={true}

        spiralEnabled={true}

        tracksViewChanges={false}

       

        // --- ERROR FIX: Unique Key for Clusters ---

        renderCluster={(cluster) => {

          if (

            !cluster.coordinate ||

            typeof cluster.coordinate.latitude !== 'number' ||

            typeof cluster.coordinate.longitude !== 'number'

          ) {

            return null;

          }

          return (

            <Marker

              key={`cluster-${cluster.id || cluster.pointCount}-${cluster.coordinate.latitude}`}

              coordinate={cluster.coordinate}

              onPress={cluster.onPress}

              tracksViewChanges={false}

            >

              <View style={styles.clusterMarker}>

                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{cluster.pointCount}</Text>

              </View>

            </Marker>

          );

        }}

      >

        {/* Render Providers */}

        {filteredProviders

          .filter(p =>

            p.avatar &&

            p.lat !== undefined && p.lng !== undefined &&

            !isNaN(Number(p.lat)) && !isNaN(Number(p.lng))

          )

          .map((p, i) => {

            // ERROR FIX: Robust Unique Key for Markers

            const markerKey = p._id ? `prov-${p._id}` : `prov-idx-${i}`;

            return (

              <Marker

                key={markerKey}

                coordinate={{ latitude: Number(p.lat), longitude: Number(p.lng) }}

                title={p.name || ''}

                onPress={() => navigation.navigate('ProviderDetail', { providerId: p._id })}

                tracksViewChanges={true}

              >

                <View style={styles.markerCircleStrict}>

                  <Image

                    source={{ uri: p.avatar }}

                    style={styles.markerImageStrictImg}

                    resizeMode="cover"

                  />

                </View>

              </Marker>

            );

          })}

      </ClusteredMapView>



      {/* --- ANIMATED THEME SWAP BAR --- */}

      <View

        style={styles.themeBarContainer}

        {...panResponder.panHandlers}

      >

        {/* Background Line */}

        <View style={styles.themeBarLine}>

         

          {/* MOVING DOT */}

          <Animated.View style={[

            styles.themeIndicator,

            {

              backgroundColor: MAP_THEMES[themeIndex].indicatorColor,

              transform: [{ translateY: dotAnimation }] // Dot ab move karega

            }

          ]} />



        </View>

      </View>



      {/* Search Bar */}

      <View style={styles.searchContainer}>

        <SearchBar

          placeholder="Search providers or services..."

          onDebouncedChange={setSearch}

        />

      </View>



      {/* Categories Bar */}

      <View style={styles.categoriesBarWrap}>

        {!catLoading && categories.length > 0 && (

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesBar}>

            <TouchableOpacity onPress={() => setSelectedCategory('')}>

              <Text style={[styles.catLabel, !selectedCategory && styles.catLabelActive]}>All</Text>

            </TouchableOpacity>

            {categories.map((cat, index) => (

              <TouchableOpacity

                key={cat._id || `cat-${index}`}

                onPress={() => setSelectedCategory(cat._id)}

              >

                <Text style={[styles.catLabel, selectedCategory === cat._id && styles.catLabelActive]}>

                  {cat.name}

                </Text>

              </TouchableOpacity>

            ))}

          </ScrollView>

        )}

      </View>



      {/* Bottom Sheet */}

      <ProviderListSheet

        providers={sheetOpen ? filteredProviders : []}

        open={sheetOpen}

        onOpen={() => setSheetOpen(true)}

        onClose={() => setSheetOpen(false)}

        onProviderPress={(provider) => {

          if (provider?.lat && provider?.lng && mapRef.current) {

            mapRef.current.animateToRegion({

              latitude: Number(provider.lat),

              longitude: Number(provider.lng),

              latitudeDelta: 0.01,

              longitudeDelta: 0.01,

            }, 600);

          }

        }}

      />

    </View>

  );

};



const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: '#fff',

  },

  map2025: {

    ...StyleSheet.absoluteFillObject,

    zIndex: 1,

  },

 

  // --- THEME BAR STYLES ---

  themeBarContainer: {

    position: 'absolute',

    right: 15,

    top: '40%',

    width: 40,

    height: 140, // Area to touch

    zIndex: 50,

    alignItems: 'center',

    justifyContent: 'flex-start', // Align to top so translate works down

  },

  themeBarLine: {

    width: 6,

    height: 120, // Line length

    backgroundColor: 'rgba(255, 255, 255, 0.8)',

    borderRadius: 3,

    borderWidth: 1,

    borderColor: '#e5e5e5',

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.2,

    shadowRadius: 2,

    elevation: 3,

    alignItems: 'center',

    // justifyContent removed so dot can float freely

  },

  themeIndicator: {

    position: 'absolute', // Absolute positioning inside the bar

    top: 2, // Start slightly from top

    width: 16,

    height: 16,

    borderRadius: 8,

    borderWidth: 2,

    borderColor: '#fff',

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 1 },

    shadowOpacity: 0.3,

    shadowRadius: 2,

    elevation: 4,

  },



  clusterMarker: {

    backgroundColor: '#ec4899',

    borderRadius: 24,

    padding: 8,

    minWidth: 48,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 2,

    borderColor: '#fff',

    shadowColor: '#ec4899',

    shadowOffset: { width: 0, height: 0 },

    shadowOpacity: 0.7,

    shadowRadius: 10,

    elevation: 8,

  },

  markerCircleStrict: {

    width: 50,

    height: 50,

    borderRadius: 25,

    backgroundColor: '#fff',

    borderWidth: 3,

    borderColor: '#ec4899',

    overflow: 'hidden',

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: '#ec4899',

    shadowOffset: { width: 0, height: 0 },

    shadowOpacity: 0.7,

    shadowRadius: 10,

    elevation: 8,

  },

  markerImageStrictImg: {

    width: '100%',

    height: '100%',

    borderRadius: 25,

  },

 

  // UI Styles

  searchContainer: {

    position: 'absolute',

    top: 50,

    left: 16,

    right: 16,

    zIndex: 20,

    backgroundColor: 'transparent',

  },

  categoriesBarWrap: {

    position: 'absolute',

    top: 110,

    left: 0,

    right: 0,

    zIndex: 19,

    height: 50,

  },

  categoriesBar: {

    paddingLeft: 16,

    paddingRight: 16,

    alignItems: 'center',

    flexDirection: 'row',

  },

  catLabel: {

    fontSize: 14,

    color: '#4b5563',

    fontWeight: '600',

    marginRight: 10,

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 20,

    backgroundColor: 'rgba(255,255,255,0.9)',

    borderWidth: 1,

    borderColor: '#e5e7eb',

    overflow: 'hidden',

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 1 },

    shadowOpacity: 0.1,

    shadowRadius: 2,

    elevation: 2,

  },

  catLabelActive: {

    color: '#fff',

    backgroundColor: '#ec4899',

    borderColor: '#ec4899',

  },

});



export default MapScreen;
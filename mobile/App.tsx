import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

// Context
import { AuthProvider, useAuth } from './app/context/AuthContext';

// Screens (Imports same hain)
import { LoginScreen } from './app/screens/LoginScreen';
import HomeScreen from './app/screens/HomeScreen';
import { ProfileScreen } from './app/screens/ProfileScreen';
import MapScreen from './app/screens/MapScreen';
import BookingsListScreen from './app/screens/BookingsListScreen';
import NotificationsScreen from './app/screens/NotificationsScreen';
import EditProfileScreen from './app/screens/EditProfileScreen';
import BookingScreen from './app/screens/BookingScreen';
import BookingConfirmScreen from './app/screens/BookingConfirmScreen';
import BookingSummaryScreen from './app/screens/BookingSummaryScreen';
import BookingConfirmationScreen from './app/screens/BookingConfirmationScreen';
import BookingConfirmationPage from './app/screens/BookingConfirmationPage';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Navigators (Stacks logic same rakhi hai) ---
const HomeStack = createNativeStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Booking" component={BookingScreen} />
      <HomeStack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
      <HomeStack.Screen name="BookingSummary" component={BookingSummaryScreen} />
      <HomeStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <HomeStack.Screen name="BookingConfirmationPage" component={BookingConfirmationPage} />
      <HomeStack.Screen name="ProviderDetail" component={require('./app/screens/ProviderDetailScreen').default} />
      <HomeStack.Screen name="BookingDetail" component={require('./app/screens/BookingDetailScreen').default} />
    </HomeStack.Navigator>
  );
}

// --- Profile Stack ---
const ProfileStack = createNativeStackNavigator();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

// --- Custom Button ---
const CustomTabBarButton = ({ children, onPress, focused, label1, label2, iconName }: any) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 300, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [focused]);

  return (
    <TouchableOpacity style={styles.centerButtonWrapper} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.centerButtonCircle, { backgroundColor: focused ? '#ec4899' : '#a3a3a3' }]}>
        <Animated.View style={{ transform: [{ translateY: bounceAnim }], alignItems: 'center' }}>
          {focused ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.goText}>{label1}</Text>
              <Text style={styles.beautyText}>{label2}</Text>
            </View>
          ) : (
            <Ionicons name={iconName} size={28} color="#fff" />
          )}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

// --- Tabs Navigator ---
const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#ec4899',
      tabBarInactiveTintColor: '#64748b',
      tabBarStyle: styles.tabBarStyle,
    }}
  >
    <Tab.Screen name="home" component={HomeStackScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} /> }} />
    <Tab.Screen name="notifications" component={NotificationsScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "notifications" : "notifications-outline"} size={26} color={color} /> }} />
    <Tab.Screen 
      name="searchNearby" 
      component={MapScreen} 
      options={{
        tabBarButton: (props) => <CustomTabBarButton {...props} focused={props.accessibilityState?.selected} label1="GO" label2="beauty" iconName="search" />
      }}
    />
    <Tab.Screen name="bookings" component={BookingsListScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "calendar" : "calendar-outline"} size={26} color={color} /> }} />
    <Tab.Screen name="profile" component={ProfileStackScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={26} color={color} /> }} />
  </Tab.Navigator>
);

// --- Main App Component ---
function AppNavigator() {
  const { user, loading, login } = useAuth();
  if (loading) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={login} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="App" component={CustomerTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}

// --- Updated Styles ---
const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    bottom: 100, // move tab bar higher
    left: 20,
    right: 20,
    height: 50, // reduced height
    borderRadius: 32, // more rounded
    backgroundColor: '#fff', // revert to solid white
    borderWidth: 2, // thicker border
    borderColor: '#D1D5DB', // darker grey for visibility
    borderTopWidth: 0, 
    elevation: 8,               // more pronounced shadow
    shadowColor: '#000',        // Custom shadow jo white corners nahi banayegi
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // iOS notch handling
    justifyContent: 'center',
  },
  centerButtonWrapper: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
  centerButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#fff', // changed to white for center icon
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  goText: { fontSize: 13, fontWeight: 'bold', color: '#fff' },
  beautyText: { fontSize: 7, color: '#fff', textTransform: 'uppercase' },
});

import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { LoginScreen } from './app/screens/LoginScreen';
import HomeScreen from './app/screens/HomeScreen';
import ServiceDetailsScreen from './app/screens/ServiceDetailsScreen';
import { ProfileScreen } from './app/screens/ProfileScreen';
import EditProfileScreen from './app/screens/EditProfileScreen';
import { SearchScreen } from './app/screens/SearchScreen';
import MapScreen from './app/screens/MapScreen';
import ProviderDetailNewScreen from './app/screens/ProviderDetailNewScreen';
import BookingScreen from './app/screens/BookingScreen';
import BookingConfirmScreen from './app/screens/BookingConfirmScreen';
import BookingsListScreen from './app/screens/BookingsListScreen';
import ProviderDashboardScreen from './app/screens/ProviderDashboardScreen';
import ProviderRequestsScreen from './app/screens/ProviderRequestsScreen';
import ProviderAvailabilityScreen from './app/screens/ProviderAvailabilityScreen';
import ProviderServicesScreen from './app/screens/ProviderServicesScreen';
import ProviderProfileManageScreen from './app/screens/ProviderProfileManageScreen';
import ProviderMoreScreen from './app/screens/ProviderMoreScreen';
import { AuthProvider, useAuth } from './app/context/AuthContext';
import CheckoutScreen from './app/screens/CheckoutScreen';
import BookingConfirmationPage from './app/screens/BookingConfirmationPage';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();
const ProviderStack = createNativeStackNavigator();


const HomeStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

import BookingConfirmationScreen from './app/screens/BookingConfirmationScreen';
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <HomeStack.Screen name="Search" component={SearchScreen} />
      <HomeStack.Screen name="ProviderDetail" component={ProviderDetailNewScreen} />
      <HomeStack.Screen name="ProviderDetailNewScreen" component={ProviderDetailNewScreen} />
      <HomeStack.Screen name="Booking" component={BookingScreen} />
      <HomeStack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
      <HomeStack.Screen name="BookingConfirmationScreen" component={BookingConfirmationScreen} />
      <HomeStack.Screen name="BookingConfirmationPage" component={BookingConfirmationPage} />
      <HomeStack.Screen name="CheckoutScreen" component={CheckoutScreen} />
    </HomeStack.Navigator>
  );
}

function BookingsStackScreen() {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="BookingsList" component={BookingsListScreen} />
      <BookingsStack.Screen name="BookingDetail" component={require('./app/screens/BookingDetailScreen').default} />
      <BookingsStack.Screen name="ProviderDetailNewScreen" component={ProviderDetailNewScreen} />
      {/* Add more booking-related screens here if needed */}
    </BookingsStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}


import NotificationsScreen from './app/screens/NotificationsScreen';

const CustomerTabs = () => (
  <Tab.Navigator
    initialRouteName="searchNearby"
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size, focused }) => {
        if (route.name === 'notifications') {
          // Heart icon, filled if focused, outline if not
          return <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size + 2} color={color} style={{ shadowColor: focused ? '#ec4899' : undefined, shadowOpacity: focused ? 0.5 : 0, shadowRadius: focused ? 8 : 0 }} />;
        }
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          'home': 'home',
          'searchNearby': 'location-outline',
          'bookings': 'calendar',
          'profile': 'person'
        };
        return <Ionicons name={icons[route.name] || 'help'} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#ec4899',
      tabBarInactiveTintColor: '#94a3b8',
      headerShown: false,
      tabBarStyle: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 64, // Increased from 48 to 64 for more space
        borderRadius: 32,
        height: 64,
        backgroundColor: 'rgba(255,255,255,0.7)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#ec4899',
        // Glass effect for iOS (and some Android):
        backdropFilter: 'blur(12px)',
        // Remove any borderTopWidth or borderTopColor overrides
        paddingHorizontal: 16,
        paddingBottom: 0,
      },
      tabBarItemStyle: {
        marginHorizontal: 8,
        borderRadius: 24,
      },
      tabBarLabelStyle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
      },
    })}
  >
    <Tab.Screen name="home" component={HomeStackScreen} options={{ title: 'Home' }} />
    <Tab.Screen name="notifications" component={NotificationsScreen} options={{ title: 'Notify' }} />
    <Tab.Screen
      name="searchNearby"
      component={MapScreen}
      options={{
        title: 'Nearby',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name="search" size={size + 6} color={color} style={{ alignSelf: 'center' }} />
        ),
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 14 },
      }}
    />
    <Tab.Screen name="bookings" component={BookingsStackScreen} options={{ title: 'Bookings' }} />
    <Tab.Screen name="profile" component={ProfileStackScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

// Remove CustomerStackNavigator, not needed anymore

const ProviderTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          'provider-dashboard': 'speedometer-outline',
          'provider-requests': 'list-outline',
          'provider-services': 'construct-outline',
          'provider-availability': 'time-outline',
          'provider-more': 'ellipsis-horizontal-circle-outline'
        };
        return <Ionicons name={icons[route.name] || 'help'} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#ec4899',
      tabBarInactiveTintColor: '#94a3b8',
      headerShown: false,
      tabBarStyle: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 48, // Moved up (closer to content, away from edge)
        borderRadius: 32,
        height: 64,
        backgroundColor: 'rgba(255,255,255,0.7)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#ec4899',
        // Glass effect for iOS (and some Android):
        backdropFilter: 'blur(12px)',
        // Remove any borderTopWidth or borderTopColor overrides
        paddingHorizontal: 16,
        paddingBottom: 0,
      },
      tabBarItemStyle: {
        marginHorizontal: 8,
        borderRadius: 24,
      },
      tabBarLabelStyle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
      },
    })}
  >
    <Tab.Screen name="provider-dashboard" component={ProviderDashboardScreen} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="provider-requests" component={ProviderRequestsScreen} options={{ title: 'Requests' }} />
    <Tab.Screen name="provider-services" component={ProviderServicesScreen} options={{ title: 'Services' }} />
    <Tab.Screen name="provider-more" component={ProviderMoreScreen} options={{ title: 'More' }} />
  </Tab.Navigator>
);

const ProviderNavigator = () => (
  <ProviderStack.Navigator screenOptions={{ headerShown: false }}>
    <ProviderStack.Screen name="ProviderTabs" component={ProviderTabs} />
    <ProviderStack.Screen name="ProviderProfileManage" component={ProviderProfileManageScreen} />
    {/* Add more screens for wallet, payment, membership here if needed */}
  </ProviderStack.Navigator>
);

const AppNavigator = () => {
  const { user, loading, login } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" options={{ animation: 'none' }}>
            {() => <LoginScreen onLogin={login} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen
            name="App"
            options={{ animation: 'none' }}
            component={user?.role === 'PROVIDER' ? ProviderNavigator : CustomerTabs}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;

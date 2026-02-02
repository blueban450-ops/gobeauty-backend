import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

// Context
import { AuthProvider, useAuth } from './app/context/AuthContext';

// Screens Imports (Ensuring they match your file structure)
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
import BookingDetailScreen from './app/screens/BookingDetailScreen'; 
import ProviderDashboardScreen from './app/screens/ProviderDashboardScreen';
import ProviderRequestsScreen from './app/screens/ProviderRequestsScreen';
import ProviderServicesScreen from './app/screens/ProviderServicesScreen';
import ProviderProfileManageScreen from './app/screens/ProviderProfileManageScreen';
import ProviderMoreScreen from './app/screens/ProviderMoreScreen';
import CheckoutScreen from './app/screens/CheckoutScreen';
import BookingConfirmationPage from './app/screens/BookingConfirmationPage';
import BookingConfirmationScreen from './app/screens/BookingConfirmationScreen';
import NotificationsScreen from './app/screens/NotificationsScreen';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Navigators Definition ---
const HomeStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const ProviderStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <HomeStack.Screen name="Search" component={SearchScreen} />
      <HomeStack.Screen name="ProviderDetail" component={ProviderDetailNewScreen} />
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
      <BookingsStack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <BookingsStack.Screen name="ProviderDetailNewScreen" component={ProviderDetailNewScreen} />
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

// --- Custom Floating Search Button ---
// ...existing code...

const CustomTabBarButton = ({ children, onPress, focused }: any) => {
  const bounceAnim = useRef(new Animated.Value(8)).current; // Start slightly lower
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (focused) {
      // Bounce up
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 8, duration: 200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 150, useNativeDriver: true })
      ]).start(() => {
        // Start glow loop after bounce
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0.5, duration: 900, useNativeDriver: true })
          ])
        ).start();
      });
    } else {
      bounceAnim.setValue(8);
      glowAnim.setValue(0.5);
    }
  }, [focused]);

  return (
    <TouchableOpacity
      style={styles.centerButtonWrapper}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.centerButtonCircle, { backgroundColor: focused ? '#a3a3a3' : '#ec4899', position: 'relative' }]}> 
        <View style={{
          position: 'absolute',
          left: 0, right: 0, top: 0, bottom: 0,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {focused ? (
            <>
              <Animated.View style={{
                alignItems: 'center',
                justifyContent: 'center',
                opacity: glowAnim,
                transform: [{ translateY: bounceAnim }],
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#fff',
                  letterSpacing: 2,
                  textAlign: 'center',
                }}>GO</Text>
                <Text style={{
                  fontSize: 10,
                  color: '#fff',
                  fontWeight: '400',
                  letterSpacing: 1,
                  marginTop: -6,
                  textAlign: 'center',
                }}>beauty</Text>
              </Animated.View>
            </>
          ) : (
            <Ionicons name="search" size={28} color="#fff" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Customer Tabs ---
const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#ec4899',
      tabBarInactiveTintColor: '#64748b',
      tabBarStyle: styles.tabBarContainer,
      // Glassy transparency support
      tabBarBackground: () => (
        <View style={[StyleSheet.absoluteFill, styles.glassyBackground]} />
      ),
    }}
  >
    <Tab.Screen name="home" component={HomeStackScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} /> }} />
    <Tab.Screen name="notifications" component={NotificationsScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "notifications" : "notifications-outline"} size={26} color={color} /> }} />
    <Tab.Screen 
      name="searchNearby" 
      component={MapScreen} 
      options={{
        tabBarIcon: () => <Ionicons name="search" size={28} color="#fff" />,
        tabBarButton: (props) => <CustomTabBarButton {...props} focused={props.accessibilityState?.selected} />
      }}
    />
    <Tab.Screen name="bookings" component={BookingsStackScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "calendar" : "calendar-outline"} size={26} color={color} /> }} />
    <Tab.Screen name="profile" component={ProfileStackScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={26} color={color} /> }} />
  </Tab.Navigator>
);

const ProviderNavigator = () => (
  <ProviderStack.Navigator screenOptions={{ headerShown: false }}>
    <ProviderStack.Screen name="ProviderTabs" component={ProviderTabs} />
    <ProviderStack.Screen name="ProviderProfileManage" component={ProviderProfileManageScreen} />
  </ProviderStack.Navigator>
);

const ProviderTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#ec4899',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: styles.tabBarContainer,
      tabBarBackground: () => <View style={[StyleSheet.absoluteFill, styles.glassyBackground]} />,
    }}
  >
    <Tab.Screen name="provider-dashboard" component={ProviderDashboardScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "speedometer" : "speedometer-outline"} size={24} color={color} /> }} />
    <Tab.Screen name="provider-requests" component={ProviderRequestsScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "list" : "list-outline"} size={24} color={color} /> }} />
    <Tab.Screen name="provider-services" component={ProviderServicesScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "construct" : "construct-outline"} size={24} color={color} /> }} />
    <Tab.Screen name="provider-more" component={ProviderMoreScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "ellipsis-horizontal-circle" : "ellipsis-horizontal-circle-outline"} size={24} color={color} /> }} />
  </Tab.Navigator>
);

// --- Root App Navigator ---
const AppNavigator = () => {
  const { user, loading, login } = useAuth();
  if (loading) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login">{(props) => <LoginScreen {...props} onLogin={login} />}</Stack.Screen>
        ) : (
          <Stack.Screen name="App" component={user?.role === 'PROVIDER' ? ProviderNavigator : CustomerTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
     position: 'absolute',
    bottom: 60,
     left: 20,
     right: 20,
     backgroundColor: 'transparent',
     elevation: 0,
     borderTopWidth: 0,
     height: 70,
     borderRadius: 30,
     overflow: 'visible',
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     paddingHorizontal: 18,
     paddingBottom: 6,
  },
  glassyBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // White transparency for glass
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: '#ec4899', // Pink border for tab bar
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  centerButtonWrapper: {
    top: -14, // Slightly less negative to avoid cutting
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#64748b', 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
});
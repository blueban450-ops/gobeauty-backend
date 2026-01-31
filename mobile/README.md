# GoBeauty Mobile (Expo scaffold)

Roman Urdu recap:
- Expo + React Native + TS, customer + pro flows.
- Tabs: Home, Map, Bookings, Favorites, Profile (customer). Pro: Dashboard, Bookings, Services, Reviews, Earnings, Profile.
- API base: `http://localhost:4000/api` (server folder). Auth via JWT. Realtime via Socket.io. Push via Expo.

Next steps (manual):
1) `npx create-expo-app mobile --template` (blank/TS) ya main yahan se files generate kar doon agar aap kahe.
2) Packages: `@react-navigation/native`, stacks/tabs, `@tanstack/react-query`, `axios`, `socket.io-client`, `expo-notifications`, `expo-location`, maps (`react-native-maps` or expo-maps), `stripe-react-native` if payments.
3) Theme ko current web UI gradients/glass se match karein.

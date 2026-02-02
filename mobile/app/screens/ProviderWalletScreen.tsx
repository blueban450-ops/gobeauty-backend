import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProviderWalletScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Wallet</Text>
      {/* Add wallet details and features here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ec4899',
    marginBottom: 16,
  },
});

export default ProviderWalletScreen;

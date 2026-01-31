import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const BaseServiceSelector = ({ services, selectedId, onSelect }) => {
  return (
    <FlatList
      data={services}
      keyExtractor={item => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, selectedId === item._id && styles.selected]}
          onPress={() => onSelect(item)}
        >
          <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
      )}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 12 }}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  selected: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  name: {
    color: '#475569',
    fontWeight: '600',
  },
});

export default BaseServiceSelector;

import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

// Debounce hook
function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type SearchBarProps = {
  onDebouncedChange: (value: string) => void;
  placeholder?: string;
};

const SearchBar = React.memo(({ onDebouncedChange, placeholder }: SearchBarProps) => {
  const [input, setInput] = useState('');
  const debounced = useDebouncedValue(input, 500);

  useEffect(() => {
    onDebouncedChange(debounced);
  }, [debounced, onDebouncedChange]);

  return (
    <View style={styles.searchBarRow}>
      <TextInput
        style={[styles.searchInput, { borderColor: '#ec4899', borderWidth: 1 }]}
        placeholder={placeholder || 'Search...'}
        value={input}
        onChangeText={setInput}
        placeholderTextColor="#a3a3a3"
        blurOnSubmit={false}
        returnKeyType="search"
        autoFocus={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 0,
    shadowColor: '#ec4899',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.08)',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 16,
    color: '#222',
    marginBottom: 0,
    borderWidth: 0,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default SearchBar;

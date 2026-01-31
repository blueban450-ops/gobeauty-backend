import React, { useRef } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';

export function WheelPicker({ data, selectedValue, onValueChange, style, itemStyle, selectedItemStyle }) {
  // Show only the selected digit/value (1 visible)
  const ITEM_HEIGHT = 28;
  const ITEM_WIDTH = 56;
  const VISIBLE_ITEMS = 1;
  const scrollRef = useRef(null);

  // Find the index of the selected value for initial scroll
  const selectedIndex = data.findIndex((item) => item === selectedValue);

  // Handler to update selection based on scroll position
  const handleMomentumScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (data[index] && data[index] !== selectedValue) {
      onValueChange(data[index]);
    }
  };

  return (
    <View style={[styles.wheelContainer, style, { alignItems: 'center', justifyContent: 'center', height: ITEM_HEIGHT * VISIBLE_ITEMS, minWidth: ITEM_WIDTH, width: ITEM_WIDTH }]}> 
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, alignSelf: 'center', width: ITEM_WIDTH }}
        contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 0 }}
        decelerationRate={0.98}
        scrollEventThrottle={16}
        bounces={true}
        overScrollMode="always"
        persistentScrollbar={false}
        snapToInterval={ITEM_HEIGHT}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onLayout={() => {
          // Scroll to selected value on mount
          if (scrollRef.current && selectedIndex >= 0) {
            setTimeout(() => {
              scrollRef.current.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
            }, 10);
          }
        }}
      >
        {data.map((item, idx) => (
          <View key={item} style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[
              styles.wheelItem,
              { textAlign: 'center', textAlignVertical: 'center', width: ITEM_WIDTH, height: ITEM_HEIGHT, lineHeight: ITEM_HEIGHT, fontSize: 15 },
              itemStyle,
              item === selectedValue && [styles.selectedItem, selectedItemStyle],
            ]}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wheelContainer: {
    width: 56,
    minWidth: 56,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    overflow: 'hidden',
  },
  wheelItem: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    textAlignVertical: 'center',
    width: 56,
    height: 28,
    lineHeight: 28,
    marginVertical: 0,
    paddingVertical: 0,
  },
  selectedItem: {
    color: '#ec4899',
    fontWeight: 'bold',
    fontSize: 18,
    // backgroundColor removed for no highlight
    // backgroundColor: '#fff',
    // borderRadius: 8,
    // paddingHorizontal: 8,
  },
});

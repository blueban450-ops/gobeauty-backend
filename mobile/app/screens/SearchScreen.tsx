import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../lib/api";

interface Provider {
  _id: string;
  name: string;
  type: string;
  city: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  homeService: boolean;
  salonVisit: boolean;
}

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;

  const [searchQuery, setSearchQuery] = useState("");
  const [homeServiceOnly, setHomeServiceOnly] = useState(false);
  const [salonVisitOnly, setSalonVisitOnly] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'forYou' | 'following'>('forYou');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch categories for Discover chips
  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const { data: providersData, isLoading: loadingProviders } = useQuery({
    queryKey: ["providers", searchQuery, homeServiceOnly, salonVisitOnly, selectedCategory, selectedTab],
    queryFn: async () => {
      const params: any = { page: 1, limit: 50 };
      if (searchQuery) params.search = searchQuery;
      if (homeServiceOnly) params.homeService = "true";
      if (salonVisitOnly) params.salonVisit = "true";
      if (selectedCategory) params.category = selectedCategory;
      // Optionally, you can filter by following if you have such API logic
      const res = await api.get("/providers", { params });
      return res.data;
    }
  });

  const providers = providersData?.providers || [];

  if (loadingProviders || loadingCats) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#60BC9B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Discover Header */}
      <View style={styles.discoverHeader}>
        <Text style={styles.discoverTitle}>Discover</Text>
        <TouchableOpacity style={styles.discoverPlus}><Text style={{fontSize: 24, color: '#ec4899'}}>+</Text></TouchableOpacity>
      </View>
      {/* For you / Following toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, selectedTab === 'forYou' && styles.toggleBtnActive]}
          onPress={() => setSelectedTab('forYou')}
        >
          <Text style={[styles.toggleText, selectedTab === 'forYou' && styles.toggleTextActive]}>For you</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, selectedTab === 'following' && styles.toggleBtnActive]}
          onPress={() => setSelectedTab('following')}
        >
          <Text style={[styles.toggleText, selectedTab === 'following' && styles.toggleTextActive]}>Following</Text>
        </TouchableOpacity>
      </View>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search providers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#6B7280"
        />
      </View>
      {/* Categories horizontal scroll - moved below search bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{alignItems:'center',paddingHorizontal:12}}>
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory('')}
        >
          <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map((cat: any) => (
          <TouchableOpacity
            key={cat._id}
            style={[styles.categoryChip, selectedCategory === cat._id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat._id)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat._id && styles.categoryTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Home/Salon filter chips */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[styles.filterChip, homeServiceOnly && styles.filterChipActive]}
          onPress={() => setHomeServiceOnly(!homeServiceOnly)}
        >
          <Text style={[styles.filterText, homeServiceOnly && styles.filterTextActive]}>
            🏠 Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, salonVisitOnly && styles.filterChipActive]}
          onPress={() => setSalonVisitOnly(!salonVisitOnly)}
        >
          <Text style={[styles.filterText, salonVisitOnly && styles.filterTextActive]}>
            💇 Salon
          </Text>
        </TouchableOpacity>
      </View>
      {/* Providers list */}
      <FlatList
        contentContainerStyle={{ ...styles.list, paddingBottom: 140 }}
        data={providers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.providerCard}
            onPress={() => {
              // @ts-ignore - Navigation typing
              navigation.navigate("ProviderDetail" as any, { providerId: item._id });
            }}
          >
            <View style={styles.providerHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.providerName}>{item.name}</Text>
                <Text style={styles.providerCity}>{item.city}</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) || "0.0"}</Text>
                  <Text style={styles.reviews}>({item.reviewCount || 0})</Text>
                </View>
              </View>
              {item.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No providers found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchBar: { backgroundColor: "white", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  searchInput: { backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: "#111827" },
  filtersRow: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "white", borderWidth: 1, borderColor: "#E5E7EB" },
  filterChipActive: { backgroundColor: "#60BC9B", borderColor: "#60BC9B" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#111827" },
  filterTextActive: { color: "white" },
  discoverHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 32, paddingBottom: 8, backgroundColor: '#fff' },
  discoverTitle: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  discoverPlus: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 24, marginHorizontal: 20, marginBottom: 8, overflow: 'hidden' },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: 'transparent' },
  toggleBtnActive: { backgroundColor: '#fff', borderRadius: 24, shadowColor: '#ec4899', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 15, fontWeight: '700', color: '#64748b' },
  toggleTextActive: { color: '#ec4899' },
  categoryScroll: { marginVertical: 4, marginBottom: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
  categoryChipActive: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  categoryTextActive: { color: 'white' },
  list: { padding: 20 },
  providerCard: { backgroundColor: "white", borderRadius: 20, padding: 16, marginBottom: 12 },
  providerHeader: { flexDirection: "row", alignItems: "flex-start" },
  providerName: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 2 },
  providerCity: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 14, fontWeight: "600", color: "#111827", marginRight: 6 },
  reviews: { fontSize: 13, color: "#6B7280" },
  verifiedBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#ec4899", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#f8fafc" },
  verifiedText: { fontSize: 16, color: "#fff", fontWeight: "bold" },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 15, color: "#6B7280" }
});

export default SearchScreen;

// app/favorites.js
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { db } from '../firebaseConfig';

const confirm = (title, message) =>
  new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Remove', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });

const PButton = ({ title, onPress, destructive }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.btn,
      destructive && styles.btnDanger,
      pressed && { opacity: 0.7 },
    ]}
  >
    <Text style={[styles.btnText, destructive && styles.btnTextOnDanger]}>{title}</Text>
  </Pressable>
);

const FavCard = React.memo(function FavCard({ item, onRemove }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text style={styles.date}>{item.date}</Text>
      <View style={{ marginTop: 8 }}>
        <PButton title="Remove Favorite" destructive onPress={() => onRemove(item)} />
      </View>
    </View>
  );
});

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const qRef = useMemo(() => {
    const col = collection(db, 'events');
    return query(col, where('isFavorite', '==', true));
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      qRef,
      (snap) => setFavorites(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error(err)
    );
    return () => unsub();
  }, [qRef]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const snap = await getDocs(qRef);
      setFavorites(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setRefreshing(false);
    }
  }, [qRef]);

  const removeFavorite = useCallback(async (event) => {
    const ok = await confirm('Remove Favorite', 'Are you sure you want to remove this from favorites?');
    if (!ok) return;

    setFavorites((prev) => prev.filter((e) => e.id !== event.id));
    try {
      await updateDoc(doc(db, 'events', event.id), { isFavorite: false });
    } catch {
      setFavorites((prev) => [...prev, event]);
    }
  }, []);

  const renderItem = ({ item }) => <FavCard item={item} onRemove={removeFavorite} />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Favorite Events</Text>

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#666', marginTop: 30 }}>
            No favorites yet. Mark some events with ☆ on the Dashboard.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <View style={styles.footer}>
        <PButton title="Back to Dashboard" onPress={() => router.replace('/dashboard')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  heading: { fontSize: 24, marginBottom: 10, textAlign: 'center', fontWeight: '600' },
  card: {
    padding: 15,
    backgroundColor: '#F7F7F8',
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#E2E2E2',
    borderWidth: 1,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  date: { fontStyle: 'italic', marginTop: 6, color: '#444' },
  footer: { marginTop: 8, alignItems: 'center' },
  btn: {
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#cfcfcf', backgroundColor: '#fff',
    minWidth: 160, alignItems: 'center',
  },
  btnDanger: { backgroundColor: '#ffefef', borderColor: '#ffbcbc' },
  btnText: { fontWeight: '600' },
  btnTextOnDanger: { color: '#c00' },
});

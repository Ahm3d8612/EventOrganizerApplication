// app/dashboard.js
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { auth, db } from '../firebaseConfig';


const confirm = (title, message) =>
  new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
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


const EventCard = React.memo(function EventCard({
  item,
  onToggleFav,
  onEdit,
  onDelete,
  mine,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text style={styles.date}>{item.date}</Text>

      <View style={styles.row}>
        <PButton
          title={item.isFavorite ? '★ Unfavorite' : '☆ Favorite'}
          onPress={() => onToggleFav(item)}
        />
        {mine && (
          <>
            <PButton title="Edit" onPress={() => onEdit(item)} />
            <PButton title="Delete" destructive onPress={() => onDelete(item.id)} />
          </>
        )}
      </View>
    </View>
  );
});


export default function DashboardScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [onlyMine, setOnlyMine] = useState(false);

  const userId = auth.currentUser?.uid || null;


  const qRef = useMemo(() => {
    const col = collection(db, 'events');
    return onlyMine && userId ? query(col, where('createdBy', '==', userId)) : col;
  }, [onlyMine, userId]);

  // Live updates
  useEffect(() => {
    const unsub = onSnapshot(
      qRef,
      (snap) => setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error(err)
    );
    return () => unsub();
  }, [qRef]);

  const logout = useCallback(() => {
    signOut(auth).then(() => router.replace('/login'));
  }, [router]);

  const deleteEvent = useCallback(async (id) => {
    const ok = await confirm('Confirm Delete', 'Are you sure you want to delete this event?');
    if (!ok) return;
    await deleteDoc(doc(db, 'events', id));
  }, []);

  const toggleFavorite = useCallback(async (evt) => {
    // optimistic UI: update local list immediately
    setEvents((prev) =>
      prev.map((e) => (e.id === evt.id ? { ...e, isFavorite: !e.isFavorite } : e))
    );
    try {
      await updateDoc(doc(db, 'events', evt.id), { isFavorite: !evt.isFavorite });
    } catch (e) {
      // revert on error
      setEvents((prev) =>
        prev.map((e) => (e.id === evt.id ? { ...e, isFavorite: evt.isFavorite } : e))
      );
    }
  }, []);

  const goEdit = useCallback(
    (evt) =>
      router.push({
        pathname: '/editEvent',
        params: {
          id: evt.id,
          title: evt.title,
          description: evt.description,
          date: evt.date,
        },
      }),
    [router]
  );

  const renderItem = ({ item }) => (
    <EventCard
      item={item}
      onToggleFav={toggleFavorite}
      onEdit={goEdit}
      onDelete={deleteEvent}
      mine={item.createdBy === userId}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Event Dashboard</Text>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Show only my events</Text>
        <Switch value={onlyMine} onValueChange={setOnlyMine} />
      </View>

      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#666', marginTop: 30 }}>
            {onlyMine ? 'No events created by you yet.' : 'No events yet. Create one!'}
          </Text>
        }
      />

      <View style={styles.footer}>
        <PButton title="Create Event" onPress={() => router.push('/createEvent')} />
        <PButton title="View Favorites" onPress={() => router.push('/favorites')} />
        <PButton title="Logout" onPress={logout} />
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: { fontWeight: '600' },
  card: {
    padding: 14,
    backgroundColor: '#F7F7F8',
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#E2E2E2',
    borderWidth: 1,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  date: { fontStyle: 'italic', marginTop: 6, marginBottom: 8, color: '#444' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    backgroundColor: '#fff',
  },
  btnDanger: { backgroundColor: '#ffefef', borderColor: '#ffbcbc' },
  btnText: { fontWeight: '600' },
  btnTextOnDanger: { color: '#c00' },
});

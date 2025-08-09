import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { db } from '../firebaseConfig';

const PButton = ({ title, onPress, disabled }) => (
  <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [
    styles.btn, disabled && styles.btnDisabled, pressed && !disabled && { opacity: 0.7 },
  ]}>
    <Text style={styles.btnText}>{title}</Text>
  </Pressable>
);

export default function EditEventView() {
  const router = useRouter();
  const { id, title: pTitle, description: pDesc, date: pDate } = useLocalSearchParams();

  const [form, setForm] = useState({ title: String(pTitle || ''), description: String(pDesc || ''), date: String(pDate || '') });
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(Boolean(pTitle || pDesc || pDate));

  useEffect(() => {
    const fetchIfNeeded = async () => {
      if (!id || hydrated) return;
      try {
        const snap = await getDoc(doc(db, 'events', String(id)));
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            title: String(data.title || ''),
            description: String(data.description || ''),
            date: String(data.date || ''),
          });
          setHydrated(true);
        }
      } catch {
        Alert.alert('Error', 'Could not load event details.');
      }
    };
    fetchIfNeeded();
  }, [id, hydrated]);

  const update = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const validate = useCallback(() => {
    const t = form.title.trim();
    const d = form.description.trim();
    const dt = form.date.trim();
    if (!t || !d || !dt) return 'Please fill in title, description, and date.';
    const ok = /^\w{3}\s\d{1,2},\s\d{4}$|^\d{1,2}-\d{1,2}-\d{4}$/.test(dt);
    if (!ok) return 'Use a date like "Aug 8, 2025" or "12-12-2026".';
    return null;
  }, [form]);

  const onSave = useCallback(async () => {
    const errMsg = validate();
    if (errMsg) { Alert.alert('Invalid Input', errMsg); return; }
    if (!id) { Alert.alert('Error', 'Missing event id.'); return; }

    try {
      setLoading(true);
      const ref = doc(db, 'events', String(id));
      await updateDoc(ref, {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date.trim(),
      });
      Alert.alert('Success', 'Event updated!');
      router.replace('/dashboard');
    } catch (e) {
      Alert.alert('Error', e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [id, form, router, validate]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Edit Event</Text>

        <TextInput style={styles.input} placeholder="Title" value={form.title} onChangeText={update('title')} />
        <TextInput style={styles.input} placeholder="Description" value={form.description} onChangeText={update('description')} multiline />
        <TextInput style={styles.input} placeholder='Date (e.g. "Aug 8, 2025" or "12-12-2026")' value={form.date} onChangeText={update('date')} autoCapitalize="none" />

        <PButton title={loading ? 'Updating…' : 'Update Event'} onPress={onSave} disabled={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, flexGrow: 1, justifyContent: 'center', gap: 12 },
  heading: { fontSize: 24, marginBottom: 8, textAlign: 'center', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#d0d0d0', backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  btn: { paddingVertical: 12, borderRadius: 10, backgroundColor: '#1F6FEB', alignItems: 'center' },
  btnDisabled: { backgroundColor: '#9FB9F5' },
  btnText: { color: '#fff', fontWeight: '700' },
});

// app/createEvent.js
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function CreateEventView() {
  const router = useRouter();

  // single object for form data (different from individual states)
  const [form, setForm] = useState({ title: '', description: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  // lightweight validation (different shape/flow)
  const validate = useCallback(() => {
    const t = form.title.trim();
    const d = form.description.trim();
    const dt = form.date.trim();
    if (!t || !d || !dt) return 'Please fill in title, description, and date.';
    // optional simple date check (accepts "Aug 8, 2025" or "12-12-2026")
    const ok = /^\w{3}\s\d{1,2},\s\d{4}$|^\d{1,2}-\d{1,2}-\d{4}$/.test(dt);
    if (!ok) return 'Use a date like "Aug 8, 2025" or "12-12-2026".';
    return null;
  }, [form]);

  const onSubmit = useCallback(async () => {
    const errorMsg = validate();
    if (errorMsg) {
      Alert.alert('Invalid Input', errorMsg);
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, 'events'), {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date.trim(),
        createdBy: auth.currentUser?.uid ?? 'anonymous',
        isFavorite: false,
      });
      Alert.alert('Success', 'Event created successfully!');
      router.replace('/dashboard');
    } catch (e) {
      Alert.alert('Error', e?.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }, [db, form, router, validate]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create Event</Text>

        <TextInput
          placeholder="Title"
          value={form.title}
          onChangeText={update('title')}
          style={styles.input}
          autoCapitalize="sentences"
        />
        <TextInput
          placeholder="Description"
          value={form.description}
          onChangeText={update('description')}
          style={styles.input}
          multiline
        />
        <TextInput
          placeholder='Date (e.g. "Aug 8, 2025" or "12-12-2026")'
          value={form.date}
          onChangeText={update('date')}
          style={styles.input}
          autoCapitalize="none"
        />

        <Button title={submitting ? 'Adding…' : 'Add Event'} onPress={onSubmit} disabled={submitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, flexGrow: 1, justifyContent: 'center', gap: 12 },
  heading: { fontSize: 24, textAlign: 'center', marginBottom: 10, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
});

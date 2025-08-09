// app/signup.js
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useCallback, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { auth } from '../firebaseConfig';

const PButton = ({ title, onPress, disabled }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.btn,
      disabled && styles.btnDisabled,
      pressed && !disabled && { opacity: 0.7 },
    ]}
  >
    <Text style={styles.btnText}>{title}</Text>
  </Pressable>
);

export default function SignUpView() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [secure, setSecure] = useState(true);
  const [busy, setBusy] = useState(false);

  const update = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const validate = useCallback(() => {
    const email = form.email.trim();
    const pass = form.password.trim();
    if (!email || !pass) return 'Please enter both email and password.';
    const emailOk = /\S+@\S+\.\S+/.test(email);
    if (!emailOk) return 'Please enter a valid email address.';
    if (pass.length < 6) return 'Password must be at least 6 characters.';
    return null;
  }, [form]);

  const onSignUp = useCallback(async () => {
    const err = validate();
    if (err) {
      Alert.alert('Invalid Input', err);
      return;
    }
    try {
      setBusy(true);
      await createUserWithEmailAndPassword(auth, form.email.trim(), form.password.trim());
      Alert.alert('Success', 'Account created!');
      router.replace('/signin'); // updated to /signin
    } catch (e) {
      Alert.alert('Signup Failed', e?.message ?? 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }, [form, router, validate]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={form.email}
          onChangeText={update('email')}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />

        <View style={styles.row}>
          <TextInput
            placeholder="Password (min 6 chars)"
            style={[styles.input, { flex: 1 }]}
            value={form.password}
            onChangeText={update('password')}
            secureTextEntry={secure}
            autoCapitalize="none"
          />
          <Pressable onPress={() => setSecure((s) => !s)} style={styles.toggle}>
            <Text>{secure ? '👁️' : '🙈'}</Text>
          </Pressable>
        </View>

        <PButton title={busy ? 'Registering…' : 'Register'} onPress={onSignUp} disabled={busy} />

        <Text style={styles.link} onPress={() => router.replace('/signin')}>
          Already have an account? Sign in
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff',
    padding: 12, marginBottom: 10, borderRadius: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  toggle: {
    paddingHorizontal: 12, paddingVertical: 10, marginLeft: 8,
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff',
  },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
  btn: { paddingVertical: 12, borderRadius: 10, backgroundColor: '#000', alignItems: 'center', marginTop: 6 },
  btnDisabled: { backgroundColor: '#9FB9F5' },
  btnText: { color: '#fff', fontWeight: '700' },
});

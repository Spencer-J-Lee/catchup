import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSignIn() {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) Alert.alert("Sign in failed", error.message);
  }

  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <Text className="text-3xl font-bold text-gray-900">Welcome back</Text>
        <Text className="text-gray-600">Sign in to keep up with friends.</Text>
        <Input
          label="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Password"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />
        <Button onPress={onSignIn} loading={submitting} disabled={!email || !password}>
          Sign in
        </Button>
        <Link href="/(auth)/signup" className="text-center text-brand-600 mt-2">
          <Text>Don't have an account? Sign up</Text>
        </Link>
      </View>
    </Screen>
  );
}

// TODO: Improve

import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSignIn = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);
    if (error) Alert.alert("Sign in failed", error.message);
  };

  return (
    <Screen
      footer={
        <View className="gap-3">
          <Button
            onPress={onSignIn}
            loading={submitting}
            disabled={!email || !password}
          >
            Sign in
          </Button>
          <Link
            href={ROUTES.auth.signup}
            className="text-center text-brand dark:text-brand-dk"
          >
            <Text>{"Don't have an account? Sign up"}</Text>
          </Link>
        </View>
      }
    >
      <View className="flex-1 justify-center gap-4">
        <Text className="text-3xl font-bold text-default dark:text-default-dk">
          Welcome back
        </Text>
        <Text className="text-muted dark:text-muted-dk">
          Sign in to keep up with friends.
        </Text>
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
      </View>
    </Screen>
  );
};

export default LoginScreen;

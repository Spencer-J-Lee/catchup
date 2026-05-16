import { Link } from "expo-router";
import * as Linking from "expo-linking";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";

const SignupScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSignUp = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: Linking.createURL("/auth-callback"),
      },
    });
    setSubmitting(false);
    if (error) {
      Alert.alert("Sign up failed", error.message);
      return;
    }
    Alert.alert(
      "Check your email",
      "If email confirmation is enabled in your Supabase project, follow the link to verify. Otherwise you're signed in.",
    );
  };

  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <Text className="text-3xl font-bold text-fg">Create account</Text>
        <Input
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
        />
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
          autoComplete="password-new"
          value={password}
          onChangeText={setPassword}
        />
        <Button
          onPress={onSignUp}
          loading={submitting}
          disabled={!email || !password || password.length < 6}
        >
          Sign up
        </Button>
        <Link href={ROUTES.auth.login} className="text-center text-brand-300 mt-2">
          <Text>Already have an account? Sign in</Text>
        </Link>
      </View>
    </Screen>
  );
};

export default SignupScreen;

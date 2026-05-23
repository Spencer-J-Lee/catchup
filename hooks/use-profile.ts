// TODO: Review

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export const profileQueryKey = (userId: string | undefined) =>
  ["profile", userId ?? "anon"] as const;

type ProfileUpdateInput = Partial<
  Pick<
    Profile,
    | "timezone"
    | "default_pre_reminder_minutes"
    | "morning_prompt_local_hour"
    | "display_name"
  >
>;

export const useProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileQueryKey(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });
};

export const useUpdateProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProfileUpdateInput) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("profiles")
        .update(input)
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey(profile.id), profile);
      queryClient.invalidateQueries({
        queryKey: profileQueryKey(profile.id),
      });
    },
  });
};

export const detectDeviceTimezone = (): string | null => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
};

export const useUserTimezone = (): string => {
  const { data: profile } = useProfile();
  return profile?.timezone ?? detectDeviceTimezone() ?? "UTC";
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { FriendInput } from "@/lib/schemas";
import type { Friend, FriendCadenceStatus } from "@/types/database";

export type FriendWithStatus = Friend & {
  last_caught_up_at: string | null;
  next_due_at: string | null;
};

const FRIENDS_KEY = ["friends"] as const;

const fetchFriends = async (): Promise<FriendWithStatus[]> => {
  const [friendsRes, statusRes] = await Promise.all([
    supabase
      .from("friends")
      .select("*")
      .order("first_name")
      .order("last_name", { nullsFirst: false }),
    supabase.from("friend_cadence_status").select("*"),
  ]);
  if (friendsRes.error) throw friendsRes.error;
  if (statusRes.error) throw statusRes.error;
  const statusByFriend = new Map<string, FriendCadenceStatus>(
    (statusRes.data ?? []).map((s) => [s.friend_id, s as FriendCadenceStatus]),
  );
  return (friendsRes.data as Friend[]).map((f) => {
    const s = statusByFriend.get(f.id);
    return {
      ...f,
      last_caught_up_at: s?.last_caught_up_at ?? null,
      next_due_at: s?.next_due_at ?? null,
    };
  });
};

export const useFriends = () => {
  return useQuery({ queryKey: FRIENDS_KEY, queryFn: fetchFriends });
};

export const useFriend = (id: string | undefined) => {
  return useQuery({
    queryKey: ["friend", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Friend;
    },
  });
};

type CreateFriendInput = FriendInput & {
  user_id: string;
  contact_id?: string | null;
  contact_snapshot?: Record<string, unknown> | null;
  avatar_url?: string | null;
  contact_synced_at?: string | null;
};

export const useCreateFriend = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateFriendInput) => {
      const { data, error } = await supabase
        .from("friends")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Friend;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: FRIENDS_KEY }),
  });
};

export const useUpdateFriend = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: FriendInput & { id: string }) => {
      const { data, error } = await supabase
        .from("friends")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Friend;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: FRIENDS_KEY });
      qc.invalidateQueries({ queryKey: ["friend", vars.id] });
    },
  });
};

export const useLinkFriendContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      contact_id: string | null;
      contact_snapshot: Record<string, unknown> | null;
      avatar_url: string | null;
    }) => {
      const { id, contact_id, contact_snapshot, avatar_url } = args;
      const { data, error } = await supabase
        .from("friends")
        .update({
          contact_id,
          contact_snapshot,
          avatar_url,
          contact_synced_at: contact_id ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Friend;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: FRIENDS_KEY });
      qc.invalidateQueries({ queryKey: ["friend", vars.id] });
    },
  });
};

export const useDeleteFriend = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("friends").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: FRIENDS_KEY }),
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { FriendInput } from "@/lib/schemas";
import { supabase } from "@/lib/supabase";
import type { Friend, FriendFrequencyStatus, Json } from "@/types/database";

export type FriendWithStatus = Friend & {
  last_caught_up_at: string | null;
  next_due_at: string | null;
};

type CreateFriendInput = FriendInput & {
  user_id: string;
  contact_id?: string | null;
  contact_snapshot?: Record<string, unknown> | null;
  avatar_url?: string | null;
  contact_synced_at?: string | null;
};

// The friends.contact_snapshot column is jsonb; app code models it as a plain
// object for ergonomics. Narrow it to the DB's Json type at the write boundary.
const toJsonSnapshot = (snapshot: Record<string, unknown> | null | undefined) =>
  (snapshot ?? null) as Json;

const fetchFriends = async (): Promise<FriendWithStatus[]> => {
  const [friendsRes, statusRes] = await Promise.all([
    supabase
      .from("friends")
      .select("*")
      .order("first_name")
      .order("last_name", { nullsFirst: false }),
    supabase.from("friend_frequency_status").select("*"),
  ]);
  if (friendsRes.error) throw friendsRes.error;
  if (statusRes.error) throw statusRes.error;

  const statusByFriend = new Map<string, FriendFrequencyStatus>();
  for (const status of statusRes.data ?? []) {
    // friend_id is nullable on the view's Row type; skip orphaned rows.
    if (status.friend_id !== null) {
      statusByFriend.set(status.friend_id, status as FriendFrequencyStatus);
    }
  }

  return (friendsRes.data as Friend[]).map((friend) => {
    const status = statusByFriend.get(friend.id);

    return {
      ...friend,
      last_caught_up_at: status?.last_caught_up_at ?? null,
      next_due_at: status?.next_due_at ?? null,
    };
  });
};

export const useFriends = () => {
  return useQuery({ queryKey: ["friends", "list"], queryFn: fetchFriends });
};

export const useFriend = (id: string | undefined) => {
  return useQuery({
    queryKey: ["friends", "by-id", id],
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

export const useCreateFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFriendInput) => {
      const { data, error } = await supabase
        .from("friends")
        .insert({
          ...input,
          contact_snapshot: toJsonSnapshot(input.contact_snapshot),
        })
        .select()
        .single();

      if (error) throw error;

      return data as Friend;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });
};

export const useCreateFriends = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inputs: CreateFriendInput[]) => {
      const { data, error } = await supabase
        .from("friends")
        .insert(
          inputs.map((input) => ({
            ...input,
            contact_snapshot: toJsonSnapshot(input.contact_snapshot),
          })),
        )
        .select();

      if (error) throw error;

      return data as Friend[];
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });
};

export const useUpdateFriend = () => {
  const queryClient = useQueryClient();

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });
};

export const useLinkFriendContact = () => {
  const queryClient = useQueryClient();

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
          contact_snapshot: toJsonSnapshot(contact_snapshot),
          avatar_url,
          contact_synced_at: contact_id ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data as Friend;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });
};

export const useDeleteFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("friends").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

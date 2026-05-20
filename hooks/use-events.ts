// TODO: Review

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { EventInput } from "@/lib/schemas";
import { supabase } from "@/lib/supabase";
import type { CatchUpEvent } from "@/types/database";

export const useScheduledEvents = () => {
  return useQuery({
    queryKey: ["events", "scheduled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .select("*")
        .eq("status", "scheduled")
        .order("event_at", { ascending: true });
      if (error) throw error;
      return data as CatchUpEvent[];
    },
  });
};

export const useMissedEvents = () => {
  return useQuery({
    queryKey: ["events", "missed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .select("*")
        .eq("status", "missed")
        .order("event_at", { ascending: false });
      if (error) throw error;
      return data as CatchUpEvent[];
    },
  });
};

export const useEventsForFriend = (friendId: string | undefined) => {
  return useQuery({
    queryKey: ["events", "by-friend", friendId],
    enabled: !!friendId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .select("*")
        .eq("friend_id", friendId!)
        .order("event_at", { ascending: false });
      if (error) throw error;
      return data as CatchUpEvent[];
    },
  });
};

export const useEvent = (id: string | undefined) => {
  return useQuery({
    queryKey: ["event", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as CatchUpEvent;
    },
  });
};

export const useAllEvents = () => {
  return useQuery({
    queryKey: ["events", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .select("*")
        .neq("status", "cancelled");
      if (error) throw error;
      return data as CatchUpEvent[];
    },
  });
};

export const useEventsInRange = (
  args: { from: string; to: string } | undefined,
) => {
  return useQuery({
    queryKey: ["events", "range", args?.from, args?.to],
    enabled: !!args,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .select("*")
        .gte("event_at", args!.from)
        .lte("event_at", args!.to);
      if (error) throw error;
      return data as CatchUpEvent[];
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EventInput & { user_id: string }) => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as CatchUpEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["events", "by-friend", data.friend_id],
      });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<EventInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as CatchUpEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["events", "by-friend", data.friend_id],
      });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("catch_up_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
};

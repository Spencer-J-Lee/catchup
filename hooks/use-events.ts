import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { EventInput } from "@/lib/schemas";
import type { CatchUpEvent } from "@/types/database";

export function useScheduledEvents() {
  return useQuery({
    queryKey: ["events", "scheduled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .select("*")
        .eq("status", "scheduled")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data as CatchUpEvent[];
    },
  });
}

export function useEventsForFriend(friendId: string | undefined) {
  return useQuery({
    queryKey: ["events", "by-friend", friendId],
    enabled: !!friendId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .select("*")
        .eq("friend_id", friendId!)
        .order("scheduled_at", { ascending: false, nullsFirst: false })
        .order("occurred_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as CatchUpEvent[];
    },
  });
}

export function useEvent(id: string | undefined) {
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
}

export function useEventsInRange(
  args: { from: string; to: string } | undefined,
) {
  return useQuery({
    queryKey: ["events", "range", args?.from, args?.to],
    enabled: !!args,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catch_up_events")
        .select("*")
        .or(
          `and(scheduled_at.gte.${args!.from},scheduled_at.lte.${args!.to}),and(occurred_at.gte.${args!.from},occurred_at.lte.${args!.to})`,
        );
      if (error) throw error;
      return data as CatchUpEvent[];
    },
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
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
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({
        queryKey: ["events", "by-friend", data.friend_id],
      });
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
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
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event", data.id] });
      qc.invalidateQueries({
        queryKey: ["events", "by-friend", data.friend_id],
      });
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("catch_up_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });
}

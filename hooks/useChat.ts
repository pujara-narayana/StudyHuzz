import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Message } from '../types';

export function useChat(matchId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;

    // Load initial messages
    supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data ?? []);
        setLoading(false);
      });

    // Subscribe to realtime inserts
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      await supabase.from('messages').insert({
        match_id: matchId,
        sender_id: userId,
        content: content.trim(),
        is_auto: false,
      });
    },
    [matchId, userId]
  );

  return { messages, loading, sendMessage };
}

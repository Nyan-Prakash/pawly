import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import type { ChatMessage, CoachConversation } from '@/types';

const EDGE_FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-coach-message`;

interface CoachStore {
  conversation: CoachConversation | null;
  messages: ChatMessage[];
  isTyping: boolean;
  rateLimitError: string | null;

  initConversation: (dogId: string) => Promise<void>;
  resetConversation: (dogId: string) => Promise<void>;
  loadHistory: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearRateLimitError: () => void;
}

export const useCoachStore = create<CoachStore>((set, get) => ({
  conversation: null,
  messages: [],
  isTyping: false,
  rateLimitError: null,

  initConversation: async (dogId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Upsert: find existing active conversation or create one
    const { data: existing } = await supabase
      .from('coach_conversations')
      .select('id, user_id, dog_id, created_at, updated_at')
      .eq('dog_id', dogId)
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const conv: CoachConversation = {
        id: existing.id,
        userId: existing.user_id,
        dogId: existing.dog_id,
        createdAt: existing.created_at,
        updatedAt: existing.updated_at,
      };
      set({ conversation: conv });
      await get().loadHistory(existing.id);
      return;
    }

    // Create new conversation
    const { data: created, error } = await supabase
      .from('coach_conversations')
      .insert({ user_id: session.user.id, dog_id: dogId, is_active: true })
      .select('id, user_id, dog_id, created_at, updated_at')
      .single();

    if (error || !created) {
      console.error('initConversation error:', error);
      return;
    }

    const conv: CoachConversation = {
      id: created.id,
      userId: created.user_id,
      dogId: created.dog_id,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    };
    set({ conversation: conv, messages: [] });
  },

  resetConversation: async (dogId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

    // The schema only allows one inactive conversation per user/dog pair,
    // so clear any previously archived thread before archiving the current one.
    const { error: removeInactiveError } = await supabase
      .from('coach_conversations')
      .delete()
      .eq('dog_id', dogId)
      .eq('user_id', userId)
      .eq('is_active', false);

    if (removeInactiveError) {
      console.error('resetConversation remove inactive error:', removeInactiveError);
      return;
    }

    const { error: deactivateError } = await supabase
      .from('coach_conversations')
      .update({ is_active: false })
      .eq('dog_id', dogId)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (deactivateError) {
      console.error('resetConversation deactivate error:', deactivateError);
      return;
    }

    const { data: created, error: createError } = await supabase
      .from('coach_conversations')
      .insert({ user_id: userId, dog_id: dogId, is_active: true })
      .select('id, user_id, dog_id, created_at, updated_at')
      .single();

    if (createError || !created) {
      console.error('resetConversation create error:', createError);
      return;
    }

    const conv: CoachConversation = {
      id: created.id,
      userId: created.user_id,
      dogId: created.dog_id,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    };

    set({
      conversation: conv,
      messages: [],
      isTyping: false,
      rateLimitError: null,
    });
  },

  loadHistory: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('coach_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error || !data) return;

    const messages: ChatMessage[] = data.map((row) => ({
      id: row.id,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      createdAt: row.created_at,
    }));
    set({ messages });
  },

  sendMessage: async (content: string) => {
    const { conversation } = get();
    if (!conversation) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Optimistically add user message to UI
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, tempUserMsg],
      isTyping: true,
      rateLimitError: null,
    }));

    try {
      console.log('Calling Edge Function:', EDGE_FUNCTION_URL);
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: content,
          conversationId: conversation.id,
          dogId: conversation.dogId,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error(`Edge Function error ${res.status}:`, JSON.stringify(json));
        if (res.status === 429) {
          set((state) => ({
            messages: state.messages.filter((m) => m.id !== tempUserMsg.id),
            isTyping: false,
            rateLimitError: json.error ?? 'Coaching limit reached.',
          }));
          return;
        }
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }

      // Replace temp message + add assistant response
      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: json.content,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        messages: [
          ...state.messages.filter((m) => m.id !== tempUserMsg.id),
          { ...tempUserMsg, id: `user_${Date.now()}` },
          assistantMsg,
        ],
        isTyping: false,
      }));
    } catch (err) {
      console.error('sendMessage error:', err);
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempUserMsg.id),
        isTyping: false,
        rateLimitError: 'Something went wrong. Please try again.',
      }));
    }
  },

  clearRateLimitError: () => set({ rateLimitError: null }),
}));

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Message } from '../types/message';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が正しく設定されているかチェック（空文字列もチェック）
const hasValidConfig =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '';

if (!hasValidConfig) {
  console.warn('Supabase環境変数が設定されていません。チャット履歴は保存されません。');
}

// 環境変数が正しく設定されている場合のみクライアントを作成
export const supabase: SupabaseClient | null = hasValidConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

interface ConversationRow {
  conversation_id: string;
  created_at: string;
  last_message_content: string | null;
}

export interface ConversationSummary {
  conversationId: string;
  lastMessageAt: string;
  lastMessageSnippet: string;
}

// メッセージをデータベースに保存
export async function saveMessage(
  message: Omit<Message, 'id'>,
  options?: { conversationId?: string; userId?: string }
): Promise<Message | null> {
  if (!supabase) {
    console.warn('Supabaseが設定されていないため、メッセージを保存できません。');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content: message.content,
        is_bot: message.is_bot,
        created_at: message.created_at,
        conversation_id: options?.conversationId ?? null,
        user_id: options?.userId ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('メッセージの保存エラー:', error);
      return null;
    }

    return {
      id: data.id,
      content: data.content,
      is_bot: data.is_bot,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('メッセージの保存中にエラーが発生しました:', error);
    return null;
  }
}

// 特定の会話のメッセージ履歴を読み込む（userIdで絞り込み）
export async function loadMessages(
  params: {
    limit?: number;
    conversationId?: string | null;
    userId?: string | null;
  } = {}
): Promise<Message[]> {
  if (!supabase) {
    console.warn('Supabaseが設定されていないため、メッセージ履歴を読み込めません。');
    return [];
  }

  const { limit = 100, conversationId, userId } = params;

  try {
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      if (error) {
        console.error('メッセージ履歴の読み込みエラー:', error);
      }
      return [];
    }

    return data.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      is_bot: msg.is_bot,
      created_at: msg.created_at,
    }));
  } catch (error) {
    console.error('メッセージ履歴の読み込み中にエラーが発生しました:', error);
    return [];
  }
}

// ユーザーごとの会話一覧を取得
export async function loadConversations(
  userId: string,
  limit: number = 20
): Promise<ConversationSummary[]> {
  if (!supabase) {
    console.warn('Supabaseが設定されていないため、会話一覧を読み込めません。');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at')
      .eq('user_id', userId)
      .not('conversation_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit * 5); // 後でクライアント側でユニーク化するため、少し多めに取得

    if (error || !data) {
      if (error) {
        console.error('会話一覧の読み込みエラー:', error);
      }
      return [];
    }

    const map = new Map<string, ConversationRow>();

    for (const row of data as any[]) {
      const convId = row.conversation_id as string | null;
      if (!convId) continue;

      if (!map.has(convId)) {
        map.set(convId, {
          conversation_id: convId,
          created_at: row.created_at as string,
          last_message_content: row.content as string,
        });
      }
    }

    return Array.from(map.values())
      .slice(0, limit)
      .map((row) => ({
        conversationId: row.conversation_id,
        lastMessageAt: row.created_at,
        lastMessageSnippet:
          row.last_message_content?.slice(0, 40) ?? '（メッセージなし）',
      }));
  } catch (error) {
    console.error('会話一覧の読み込み中にエラーが発生しました:', error);
    return [];
  }
}


interface DifyMessage {
  inputs: Record<string, any>;
  query: string;
  response_mode: 'blocking' | 'streaming';
  conversation_id?: string;
  user: string;
}

interface DifyResponse {
  answer: string;
  conversation_id: string;
  metadata?: any;
}

export async function callDifyAPI(
  message: string,
  userId: string,
  conversationId?: string
): Promise<DifyResponse> {
  const apiUrl = import.meta.env.VITE_DIFY_API_URL || 'https://api.dify.ai/v1';
  const apiKey = import.meta.env.VITE_DIFY_API_KEY;

  if (!apiKey) {
    throw new Error('DIFY_API_KEY is not set. Please check your .env file.');
  }

  const payload: DifyMessage = {
    inputs: {},
    query: message,
    response_mode: 'blocking',
    // 会話IDが空文字列の場合は送信しない（新規会話）
    ...(conversationId ? { conversation_id: conversationId } : {}),
    user: userId,
  };

  const response = await fetch(`${apiUrl}/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || response.statusText;
    throw new Error(
      `Dify API error: ${response.status} ${errorMessage}`
    );
  }

  const data = await response.json();
  return {
    answer: data.answer || '応答を取得できませんでした。',
    conversation_id: data.conversation_id || conversationId || '',
    metadata: data.metadata,
  };
}


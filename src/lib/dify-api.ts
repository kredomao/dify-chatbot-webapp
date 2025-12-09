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
    conversation_id: conversationId || '',
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
    throw new Error(
      `Dify API error: ${response.status} ${response.statusText}. ${errorData.message || ''}`
    );
  }

  const data = await response.json();
  return {
    answer: data.answer || '応答を取得できませんでした。',
    conversation_id: data.conversation_id || conversationId || '',
    metadata: data.metadata,
  };
}


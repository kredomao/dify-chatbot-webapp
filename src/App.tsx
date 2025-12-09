import { useState, useEffect, useRef } from 'react';
import { callDifyAPI } from './lib/dify-api';
import { Message } from './types/message';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { MessageCircle } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // ユーザーID（実際の実装では認証から取得）
  const userId = `web-user-${Date.now()}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 初期化時にローディングを終了
    setLoading(false);
  }, []);

  const getBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await callDifyAPI(userMessage, userId, conversationId);
      
      // 会話IDを保存（次回の会話継続用）
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      
      return response.answer;
    } catch (error: any) {
      console.error('Dify API error:', error);
      return `エラーが発生しました: ${error.message || '不明なエラー'}`;
    }
  };

  const handleSendMessage = async (content: string) => {
    setSending(true);

    try {
      // ユーザーメッセージを追加
      const userMessage: Message = {
        id: Date.now().toString(),
        content: content,
        is_bot: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Dify APIを呼び出してボット応答を取得
      const botResponse = await getBotResponse(content);

      // ボットメッセージを追加
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        is_bot: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        is_bot: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <header className="bg-white shadow-md border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                AIチャットボット
              </h1>
              <p className="text-sm text-gray-500">いつでもお話しください</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="w-16 h-16 mb-4" />
              <p className="text-lg">メッセージを送信して会話を始めましょう</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSendMessage={handleSendMessage} disabled={sending} />
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Message } from './types/message';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { MessageCircle } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('こんにちは') || lowerMessage.includes('はじめまして')) {
      return 'こんにちは！何かお手伝いできることはありますか？';
    }
    if (lowerMessage.includes('ありがとう')) {
      return 'どういたしまして！他に何かお手伝いできることはありますか？';
    }
    if (lowerMessage.includes('天気')) {
      return '申し訳ありませんが、リアルタイムの天気情報は取得できません。天気予報サイトをご確認ください。';
    }
    if (lowerMessage.includes('時間')) {
      return `現在の時刻は ${new Date().toLocaleTimeString('ja-JP')} です。`;
    }
    if (lowerMessage.includes('名前')) {
      return '私はチャットボットです。お手伝いできることがあれば教えてください！';
    }
    if (lowerMessage.includes('できる') || lowerMessage.includes('機能')) {
      return 'メッセージのやり取りができます。質問や会話をお気軽にどうぞ！';
    }
    if (lowerMessage.includes('さようなら') || lowerMessage.includes('バイバイ')) {
      return 'さようなら！またお話ししましょう！';
    }

    const responses = [
      'なるほど、興味深いですね！もっと詳しく教えてください。',
      'それについて詳しく聞かせてください。',
      '面白い視点ですね。他にも何かありますか？',
      'そうなんですね！それについてもっと知りたいです。',
      'ご質問ありがとうございます。どのようにお手伝いできますか？',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (content: string) => {
    setSending(true);

    try {
      const { error: userError } = await supabase
        .from('messages')
        .insert([{ content, is_bot: false }]);

      if (userError) throw userError;

      await fetchMessages();

      setTimeout(async () => {
        const botResponse = getBotResponse(content);

        const { error: botError } = await supabase
          .from('messages')
          .insert([{ content: botResponse, is_bot: true }]);

        if (botError) throw botError;

        await fetchMessages();
        setSending(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
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

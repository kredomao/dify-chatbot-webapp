import { useState, useEffect, useRef } from 'react';
import { callDifyAPI } from './lib/dify-api';
import { loadConversations, loadMessages, saveMessage } from './lib/supabase';
import { Message } from './types/message';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ConversationList from './components/ConversationList';
import SearchBar from './components/SearchBar';
import { MessageCircle, Search } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [conversations, setConversations] = useState<
    Awaited<ReturnType<typeof loadConversations>>
  >([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ユーザーID（実際の実装では認証から取得）- 固定値にする
  const [userId] = useState(() => `web-user-${Date.now()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 初期化時にデータベースから履歴と会話一覧を読み込む
    const initialize = async () => {
      try {
        const [history, convs] = await Promise.all([
          loadMessages({ userId }),
          loadConversations(userId),
        ]);
        if (history.length > 0) {
          setMessages(history);
          setAllMessages(history);
        }
        setConversations(convs);
      } catch (error) {
        console.error('初期データの読み込みエラー:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [userId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = allMessages.filter((msg) =>
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
      setMessages(filtered);
    } else {
      setMessages(allMessages);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setMessages(allMessages);
    setSearchActive(false);
  };

  const handleQuickAction = (message: string) => {
    handleSendMessage(message);
  };

  const getBotResponse = async (userMessage: string, currentConversationId: string): Promise<{ answer: string; conversationId: string }> => {
    try {
      const response = await callDifyAPI(userMessage, userId, currentConversationId);
      
      return {
        answer: response.answer,
        conversationId: response.conversation_id || currentConversationId,
      };
    } catch (error: any) {
      console.error('Dify API error:', error);
      throw error; // エラーを再スローして、handleSendMessageで処理
    }
  };

  const handleSendMessage = async (content: string) => {
    setSending(true);

    try {
      // ユーザーメッセージを作成
      const userMessageData = {
        content: content,
        is_bot: false,
        created_at: new Date().toISOString(),
      };

      // データベースに保存
      const savedUserMessage = await saveMessage(userMessageData, {
        conversationId: conversationId || null,
        userId,
      });
      const userMessage: Message = savedUserMessage || {
        id: Date.now().toString(),
        ...userMessageData,
      };

      // UIに追加
      setMessages((prev) => [...prev, userMessage]);
      setAllMessages((prev) => [...prev, userMessage]);

      // Dify APIを呼び出してボット応答を取得
      const response = await getBotResponse(content, conversationId);

      // 会話IDを更新（次回の会話継続用）
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      // ボットメッセージを作成
      const botMessageData = {
        content: response.answer,
        is_bot: true,
        created_at: new Date().toISOString(),
      };

      // データベースに保存
      const savedBotMessage = await saveMessage(botMessageData, {
        conversationId: response.conversationId || conversationId || null,
        userId,
      });
      const botMessage: Message = savedBotMessage || {
        id: (Date.now() + 1).toString(),
        ...botMessageData,
      };

      // UIに追加
      setMessages((prev) => [...prev, botMessage]);
      setAllMessages((prev) => [...prev, botMessage]);

      // 会話一覧を更新
      const updatedConversations = await loadConversations(userId);
      setConversations(updatedConversations);
      
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

  const handleSelectConversation = async (selectedId: string | null) => {
    setLoading(true);
    try {
      setConversationId(selectedId || '');
      const history = await loadMessages({
        conversationId: selectedId || undefined,
        userId,
      });
      setMessages(history);
      setAllMessages(history);
      setSearchActive(false);
      setSearchQuery('');
    } catch (error) {
      console.error('会話の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setConversationId('');
    setMessages([]);
    setAllMessages([]);
    setSearchActive(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto h-screen flex">
        <ConversationList
          conversations={conversations}
          currentConversationId={conversationId || null}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onQuickAction={handleQuickAction}
        />
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-md border-b border-gray-200">
            <div className="p-4 flex items-center gap-3 justify-between">
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
              <button
                onClick={() => setSearchActive(!searchActive)}
                className={`p-2 rounded-lg transition-colors ${
                  searchActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              isActive={searchActive}
            />
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
    </div>
  );
}

export default App;

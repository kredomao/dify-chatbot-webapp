import { ConversationSummary } from '../lib/supabase';

interface ConversationListProps {
  conversations: ConversationSummary[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string | null) => void;
  onNewConversation: () => void;
}

export default function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white/80 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">会話一覧</h2>
        <button
          type="button"
          onClick={onNewConversation}
          className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          新しい会話
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-xs text-gray-400 p-4">まだ会話はありません。</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((conv) => {
              const isActive = conv.conversationId === currentConversationId;
              return (
                <li key={conv.conversationId}>
                  <button
                    type="button"
                    onClick={() => onSelectConversation(conv.conversationId)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="truncate text-xs text-gray-500 mb-1">
                      {new Date(conv.lastMessageAt).toLocaleString('ja-JP', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="truncate">{conv.lastMessageSnippet}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}



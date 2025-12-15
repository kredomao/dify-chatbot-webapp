import { Lightbulb, Clock, HelpCircle, FileText, Zap } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  message: string;
}

interface QuickActionsProps {
  onSelectAction: (message: string) => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'help',
    label: 'ヘルプ',
    icon: <HelpCircle className="w-4 h-4" />,
    message: 'このチャットボットで何ができるか教えてください',
  },
  {
    id: 'documents',
    label: '資料',
    icon: <FileText className="w-4 h-4" />,
    message: '会社の重要な資料や文書について教えてください',
  },
  {
    id: 'schedule',
    label: '日程',
    icon: <Clock className="w-4 h-4" />,
    message: '今月の重要な予定やイベントを教えてください',
  },
  {
    id: 'tips',
    label: 'Tips',
    icon: <Zap className="w-4 h-4" />,
    message: '仕事の効率化のコツを教えてください',
  },
];

export default function QuickActions({
  onSelectAction,
}: QuickActionsProps) {
  return (
    <div className="p-4 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs font-semibold text-gray-700">クイックアクション</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => onSelectAction(action.message)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs text-gray-700 hover:text-blue-700 font-medium"
          >
            <span className="text-blue-600">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

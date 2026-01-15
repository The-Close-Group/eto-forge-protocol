import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  children: React.ReactNode;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};

const styles = {
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
  success: 'bg-green-500/10 border-green-500/30 text-green-200',
  error: 'bg-red-500/10 border-red-500/30 text-red-200',
};

export function Callout({ type = 'info', children }: CalloutProps) {
  const Icon = icons[type];

  return (
    <div className={cn('my-6 flex gap-3 rounded-lg border p-4', styles[type])}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="prose-sm prose-invert">{children}</div>
    </div>
  );
}

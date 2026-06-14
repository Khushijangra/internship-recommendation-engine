import React from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Download } from 'lucide-react';
import { Button } from './button';

interface AlertToastProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

const variantStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: <CheckCircle className="w-4 h-4 text-green-600" />,
    iconBg: 'bg-green-100'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: <AlertCircle className="w-4 h-4 text-red-600" />,
    iconBg: 'bg-red-100'
  },
  warning: {
    container: 'bg-orange-50 border-orange-200 text-orange-800',
    icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
    iconBg: 'bg-orange-100'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="w-4 h-4 text-blue-600" />,
    iconBg: 'bg-blue-100'
  }
};

export function AlertToast({ variant, title, description, onClose, action }: AlertToastProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${styles.container} shadow-sm`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.iconBg} shrink-0`}>
        {styles.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium">{title}</div>
        {description && (
          <div className="text-sm opacity-90 mt-1">{description}</div>
        )}
        {action && (
          <Button
            variant="ghost" 
            size="sm"
            className="mt-2 h-8 px-3 text-current hover:bg-current/10"
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>

      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-current hover:bg-current/10"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
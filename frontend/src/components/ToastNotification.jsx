import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

const TOAST_STYLES = {
  success: { bg: 'bg-status-greenLight', border: 'border-green-300', icon: CheckCircle, iconColor: 'text-status-greenText' },
  warning: { bg: 'bg-status-amberBg', border: 'border-amber-300', icon: AlertTriangle, iconColor: 'text-status-amberText' },
  danger: { bg: 'bg-status-redLight', border: 'border-red-300', icon: AlertOctagon, iconColor: 'text-status-redText' },
  info: { bg: 'bg-blue-50', border: 'border-blue-300', icon: Info, iconColor: 'text-brand-blue' },
};

export const ToastNotification = () => {
  const { toasts } = useApp();
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        const Icon = style.icon;
        return (
          <div key={toast.id}
            className={`${style.bg} border ${style.border} rounded-xl shadow-lg p-4 min-w-[320px] max-w-[400px] flex items-start gap-3 animate-slide-in`}
          >
            <Icon size={18} className={`${style.iconColor} flex-shrink-0 mt-0.5`} />
            <p className="text-sm text-txt-secondary flex-1">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ToastNotification;

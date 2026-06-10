import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

export const Alert = ({ type = 'info', children, className = '' }) => {
  const styles = {
    success: {
      container: 'border-green-200 bg-green-50 text-green-800',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />
    },
    error: {
      container: 'border-red-200 bg-red-50 text-red-800',
      icon: <XCircle className="h-5 w-5 text-red-600" />
    },
    warning: {
      container: 'border-amber-200 bg-amber-50 text-amber-800',
      icon: <AlertCircle className="h-5 w-5 text-amber-600" />
    },
    info: {
      container: 'border-blue-200 bg-blue-50 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-600" />
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${currentStyle.container} ${className}`}>
      <div className="shrink-0 mt-0.5">
        {currentStyle.icon}
      </div>
      <div className="text-sm font-medium flex-1">
        {children}
      </div>
    </div>
  );
};

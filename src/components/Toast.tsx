import React from 'react';
import { useLab } from '../context/LabContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useLab();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`toast-item ${isSuccess ? 'toast-success' : isError ? 'toast-error' : 'toast-info'}`}
          >
            <div className="toast-icon">
              {isSuccess && <CheckCircle2 size={18} className="text-emerald-400" />}
              {isError && <AlertCircle size={18} className="text-rose-400" />}
              {!isSuccess && !isError && <Info size={18} className="text-primary" />}
            </div>

            <div className="toast-content">
              <p className="toast-message">{toast.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

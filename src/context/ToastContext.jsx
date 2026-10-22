import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'success', duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none no-print">
        {toasts.map((toast) => {
          let bgClass = "bg-brand-dark text-white border-brand-teal";
          let IconComponent = CheckCircle2;
          let iconColor = "text-brand-sand";

          if (toast.type === 'error') {
            bgClass = "bg-[#451e18] text-white border-red-400";
            IconComponent = AlertCircle;
            iconColor = "text-red-400";
          } else if (toast.type === 'warning') {
            bgClass = "bg-[#3f3521] text-amber-50 border-amber-400";
            IconComponent = AlertTriangle;
            iconColor = "text-amber-400";
          } else if (toast.type === 'info') {
            bgClass = "bg-brand-dark text-white border-teal-400";
            IconComponent = Info;
            iconColor = "text-teal-300";
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-elevated border transition-all duration-300 animate-slide-in ${bgClass}`}
            >
              <IconComponent className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                {toast.title && <h5 className="font-semibold text-sm tracking-wide">{toast.title}</h5>}
                <p className="text-xs text-stone-200 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-white transition-colors p-1 -mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

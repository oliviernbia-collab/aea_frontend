import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

const STYLES = {
  succes: { icon: 'fa-circle-check', className: 'bg-green-600 text-white' },
  erreur: { icon: 'fa-circle-exclamation', className: 'bg-red-600 text-white' },
  info: { icon: 'fa-circle-info', className: 'bg-blue-800 text-white' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'succes') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[90vw]">
        {toasts.map((t) => {
          const style = STYLES[t.type] || STYLES.info;
          return (
            <div
              key={t.id}
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg ${style.className} animate-[fadeIn_0.2s_ease-out]`}
            >
              <i className={`fa-solid ${style.icon}`} />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit etre utilise dans un ToastProvider.');
  return ctx;
}

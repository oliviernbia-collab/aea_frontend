import { useState } from 'react';

export default function PasswordInput({ className = '', icon = true, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {icon && <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-2 ${icon ? 'pl-9' : 'pl-3'} pr-10 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-eye'}`} />
      </button>
    </div>
  );
}

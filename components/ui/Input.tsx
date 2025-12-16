import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>}
      <input
        className={`w-full bg-slate-800 border ${error ? 'border-rose-500' : 'border-slate-700'} rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
};
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>}
      <textarea
        className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none ${className}`}
        {...props}
      />
    </div>
  );
};
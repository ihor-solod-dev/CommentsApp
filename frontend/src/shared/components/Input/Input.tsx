import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className = '', ...rest }, ref) => (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-medium text-slate-700">{label}</label>
            )}
            <input
                ref={ref}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white transition-all duration-150
                    placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-offset-0
                    ${error
                        ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
                        : 'border-slate-300 focus:ring-blue-300 focus:border-blue-400'
                    } ${className}`}
                {...rest}
            />
            {error && <span className="text-xs text-red-500 flex items-center gap-1">{error}</span>}
            {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
        </div>
    ),
);

Input.displayName = 'Input';
import React from 'react';

export const Spinner: React.FC<{ size?: number; className?: string }> = ({
    size = 24,
    className = '',
}) => (
    <div
        style={{ width: size, height: size }}
        className={`border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin ${className}`}
    />
);
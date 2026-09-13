import React from 'react';
import { RegisterForm } from '../../features/auth/components/RegisterForm';
import { MessageSquare } from 'lucide-react';

export const RegisterPage: React.FC = () => (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={22} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Реєстрація</h1>
                <p className="text-sm text-slate-500 mt-1">Приєднуйтесь до спільноти</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <RegisterForm />
            </div>
        </div>
    </div>
);
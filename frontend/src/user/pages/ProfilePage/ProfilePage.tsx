import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@shared/components/Input/Input';
import { Button } from '@shared/components/Button/Button';
import { useProfileViewModel } from './useProfileViewModel';
import { Camera, User as UserIcon, Mail, Calendar, Shield } from 'lucide-react';
import { formatDate } from '@shared/utils/format-date';

const FILES_URL = import.meta.env.VITE_FILES_URL;

interface ProfileFormData {
    username: string;
    email: string;
}

export const ProfilePage: React.FC = () => {
    const { user, isLoading, isUploading, updateProfile, uploadAvatar } = useProfileViewModel();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
        defaultValues: { username: user?.username ?? '', email: user?.email ?? '' },
    });

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Профіль</h1>

            <div className="flex flex-col gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                {user?.avatar ? (
                                    <img
                                        src={`${FILES_URL}${user.avatar}`}
                                        alt="Аватар"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserIcon size={32} className="text-white" />
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-blue-600 rounded-xl
                                    flex items-center justify-center text-white hover:bg-blue-700
                                    transition-colors shadow-md disabled:opacity-50"
                                title="Змінити аватар (незабаром)"
                            >
                                {isUploading ? (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Camera size={13} />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/gif"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) uploadAvatar(f);
                                }}
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">{user?.username}</h2>
                            <p className="text-sm text-slate-500">{user?.email}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${user?.role === 'admin'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    <Shield size={10} />
                                    {user?.role === 'admin' ? 'Адміністратор' : 'Користувач'}
                                </span>
                                {user?.createdAt && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                        <Calendar size={10} />
                                        {formatDate(user.createdAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(updateProfile)} className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold text-slate-700">Редагувати дані</h3>
                        <Input
                            label="Ім'я користувача"
                            error={errors.username?.message}
                            {...register('username', {
                                minLength: { value: 3, message: 'Мінімум 3 символи' },
                                pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Лише латиниця, цифри та _' },
                            })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            error={errors.email?.message}
                            {...register('email', { required: "Email обов'язковий" })}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" isLoading={isLoading}>
                                Зберегти зміни
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-start gap-2">
                        <Mail size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-slate-600">Email підтверджений</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Ваша пошта використовується тільки для входу та сповіщень
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
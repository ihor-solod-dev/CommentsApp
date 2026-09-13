import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Input } from '@shared/components/Input/Input';
import { Button } from '@shared/components/Button/Button';
import { useAuthForm } from '../hooks/useAuthForm';

interface LoginFormData {
    email: string;
    password: string;
}

export const LoginForm: React.FC = () => {
    const { login, isLoading } = useAuthForm();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

    return (
        <form onSubmit={handleSubmit(login)} className="flex flex-col gap-4">
            <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register('email', { required: "Email обов'язковий" })}
            />
            <Input
                label="Пароль"
                type="password"
                error={errors.password?.message}
                {...register('password', { required: "Пароль обов'язковий" })}
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
                Увійти
            </Button>
            <p className="text-center text-sm text-gray-600">
                Немає акаунту?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                    Зареєструватись
                </Link>
            </p>
        </form>
    );
};
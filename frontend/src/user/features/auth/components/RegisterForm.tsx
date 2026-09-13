import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Input } from '@shared/components/Input/Input';
import { Button } from '@shared/components/Button/Button';
import { useAuthForm } from '../hooks/useAuthForm';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
}

export const RegisterForm: React.FC = () => {
    const { register: registerUser, isLoading } = useAuthForm();
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();

    return (
        <form onSubmit={handleSubmit(registerUser)} className="flex flex-col gap-4">
            <Input
                label="Ім'я користувача"
                error={errors.username?.message}
                {...register('username', {
                    required: "Ім'я обов'язкове",
                    minLength: { value: 3, message: 'Мінімум 3 символи' },
                    pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Тільки латиниця, цифри та _' },
                })}
            />
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
                {...register('password', {
                    required: "Пароль обов'язковий",
                    minLength: { value: 8, message: 'Мінімум 8 символів' },
                    pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Потрібна велика літера, мала літера та цифра',
                    },
                })}
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
                Зареєструватись
            </Button>
            <p className="text-center text-sm text-gray-600">
                Вже є акаунт?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                    Увійти
                </Link>
            </p>
        </form>
    );
};
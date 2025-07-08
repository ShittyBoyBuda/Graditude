'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './LoginPage.module.css';

interface FormData {
    email: string;
    password: string;
}

export default function LoginPage() {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });

    const [role, setRole] = useState<'student' | 'teacher'>('student');

    const router = useRouter();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value });
    };

    const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRole(e.target.value as 'student' | 'teacher');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const endpoint = role === 'student' ? '/api/login/student' : '/api/login/teacher';

        try {
            const response = await axios.post(endpoint, formData);

            const token = response.data.access_token;
            localStorage.setItem('token', token);
            
            alert('Вход выполнен успешно!');
            router.push('/coursework');
        } catch (error) {
            alert(`Ошибка ${error}`);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2>Вход</h2>
                <form onSubmit={handleSubmit}>
                    <p>Укажите, кем вы являетесь</p>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="role"
                                value="student"
                                checked={role === 'student'}
                                onChange={handleRoleChange}
                            />
                            Студент
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="role"
                                value="teacher"
                                checked={role === 'teacher'}
                                onChange={handleRoleChange}
                            />
                            Преподаватель
                        </label>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>E-mail</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Введите ваш email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Пароль</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Введите ваш пароль"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className={styles.submitButton}>Войти</button>
                </form>
                <div className={styles.loginLink}>
                    Ещё нет аккаунта? <a href="/register">Зарегистрироваться</a>
                </div>
            </div>
        </div>
    );
}

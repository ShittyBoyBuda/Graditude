'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import styles from './RegisterPage.module.css';

interface FormData {
    firstName: string;
    lastName: string;
    surname?: string;
    email: string;
    password: string;
}

export default function RegisterPage() {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        surname: '',
        email: '',
        password: '',
    });

    const [role, setRole] = useState<'student' | 'teacher'>('student');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value });
    };

    const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRole(e.target.value as 'student' | 'teacher');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const endpoint = role === 'student' ? '/api/register/student' : '/api/register/teacher';

        try {
            const response = await axios.post(endpoint, formData);
            alert('Регистрация прошла успешно!');
        } catch (error) {
            alert(`Ошибка ${error}`);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2>Регистрация</h2>
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
                        <label>Имя</label>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="Введите ваше имя"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Фамилия</label>
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Введите вашу фамилию"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Отчество</label>
                        <input
                            type="text"
                            name="surname"
                            placeholder="Введите ваше отчество"
                            value={formData.surname}
                            onChange={handleChange}
                        />
                        <div className={styles.optionalNote}>*Поле не обязательно для заполнения</div>
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

                    <button type="submit" className={styles.submitButton}>Создать</button>
                </form>
                <div className={styles.loginLink}>
                    Уже есть аккаунт? Тогда <a href="/login">войдите</a>
                </div>
            </div>
        </div>
    );
}

'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import styles from './TeachersPage.module.css';
import Header from "../components/Header/Header";

interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
    surname: string;
    availableSlots: number;
    totalSlots: number;
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Токен отсутствует. Авторизуйтесь заново');
                    return;
                }

                const response = await axios.get('http://localhost:3000/teachers', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTeachers(response.data);
            } catch (error: any) {
                console.log(error);
                setError(error?.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className={styles.teachersPage}>
            <Header/>
            <h1 className={styles.pageTitle}>Кураторы научных работ</h1>

            {/* Список учителей */}
            <div className={styles.teachersList}>
                {teachers.map((teacher) => (
                    <div key={teacher.id} className={styles.teacherCard}>
                        <img
                            src={`https://avatars.dicebear.com/api/initials/${teacher.lastName}-${teacher.firstName}.svg`}
                            alt={`${teacher.lastName} ${teacher.firstName}`}
                            className={styles.teacherAvatar}
                        />
                        <h2 className={styles.teacherName}>
                            {teacher.lastName} {teacher.firstName} {teacher.surname}
                        </h2>
                        <p className={styles.teacherSlots}>
                            Свободных мест: {teacher.availableSlots} / {teacher.totalSlots}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

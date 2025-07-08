'use client';

import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    surname: string;
    email: string;
}

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User>();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/user/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        
        fetchProfile();
    }, []);

    if (!user) return <div>Загрузка...</div>;

    // Функция для проверки, активна ли кнопка для текущего пути
    const isActive = (path: string) => pathname === path ? styles.active : '';

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <img src='/LogoGraditude.svg' alt="Graditude" />
            </div>
            <nav className={styles.nav}>
                <button
                    className={`${styles.navButton} ${isActive('/my')}`}
                    onClick={() => router.push('/my')}
                >
                    Моя работа
                </button>
                <button
                    className={`${styles.navButton} ${isActive('/coursework')}`}
                    onClick={() => router.push('/coursework')}
                >
                    Все работы
                </button>
                <button
                    className={`${styles.navButton} ${isActive('/teacher')}`}
                    onClick={() => router.push('/teacher')}
                >
                    Кураторы
                </button>
                <button
                    className={`${styles.navButton} ${isActive('/messages')}`}
                    onClick={() => router.push('/messages')}
                >
                    Сообщения
                </button>
            </nav>
            <div className={styles.userProfile}>
                <span>{user.lastName} {user.firstName.slice(0, 1)}. {user.surname.slice(0, 1)}.</span>
                <img
                    src="https://avatars.dicebear.com/api/initials/ТВА.svg"
                    alt="User avatar"
                    className={styles.avatar}
                />
            </div>
        </header>
    );
}

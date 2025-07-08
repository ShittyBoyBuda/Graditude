'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import styles from './CourseworkPage.module.css';
import Header from "../components/Header/Header";
import Link from 'next/link';


interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
    surname: string;
    availableSlots: number;
    totalSlots: number;
}

interface Courswork {
    id: number;
    title: string;
    description: string;
    difficult: string;
    isAvailable: boolean;
    student: string;
    teacher: Teacher;
    progresses: string[];
    tags: string[];
}

interface ModalProps {
    show: boolean;
    onClose: () => void;
    content: JSX.Element | null;
    role?: string;
    courseWorkId: number | null;
}


export default function CourseWorkPage() {
    const [courseworkList, setCourseworkList] = useState<Courswork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
    const [userRole, setUserRole] = useState<string | undefined>(undefined);
    const [selectedCourseWorkId, setSelectedCourseWorkId] = useState<number | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

    const colors = [
        // Зеленые оттенки
        "#C8E6C9", // пастельный зеленый
        "#A5D6A7", // мягкий зеленый
        "#E8F5E9", // очень светлый зеленый
        "#DCEDC8", // дополнительный светлый зеленый
      
        // Синие оттенки
        "#E3F2FD", // очень светлый синий
        "#BBDEFB", // пастельный синий
        "#B3E5FC", // нежный голубой
        "#B2EBF2", // дополнительный пастельный синий
      
        // Красные оттенки
        "#FFCDD2", // пастельный красный
        "#F8BBD0", // мягкий красновато-розовый
        "#FFABAB", // нежный красный
        "#FF8A80", // дополнительный светлый красный
      
        // Желтые оттенки
        "#FFF9C4", // пастельный желтый
        "#FFF59D", // мягкий желтый
        "#FFFDE7", // очень светлый желтый
        "#FFF9E3", // дополнительный почти белый желтый
      
        // Розовые оттенки
        "#FCE4EC", // пастельный розовый
        "#F48FB1", // нежный розовый
        "#FFB6C1", // классический светло-розовый
        "#FF80AB"  // дополнительный пастельный розовый
      ];
      


    // Функция, вычисляющая цвет по имени тега
    const getTagColor = (tagName: string): string => {
        let hash = 0;
        for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };
  

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          setUserRole(decodedToken.role);
        } else {
            setUserRole(undefined);
        }
      }, []);

      const fetchCoursework = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Токен отсутствует. Авторизуйтесь заново');
                return;
            }

            const [courseworkResponse, teachersResponse] = await Promise.all([
                axios.get('http://localhost:3000/coursework', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('http://localhost:3000/teachers', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setCourseworkList(courseworkResponse.data);
            setTeachers(teachersResponse.data);
        } catch (error: any) {
            console.log(error);
            setError(error?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoursework(); // Первоначальная загрузка данных
    }, []);


    function Modal({ show, onClose, content, role, courseWorkId }: ModalProps) {
        if (!show) return null;
    
        const handleSelectCourseWork = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Вы не авторизованы. Пожалуйста, войдите в систему');
                    return;
                }
    
                await axios.post(
                    'http://localhost:3000/coursework/select',
                    { courseWorkId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
    
                alert('Вы успешно записались на курсовую работу!');
                onClose();
                await fetchCoursework();
            } catch (error) {
                console.error(error);
                alert('Произошла ошибка. Попробуйте снова');
            }
        };

    
        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                    <button className={styles.modalClose} onClick={onClose}>
                        ×
                    </button>
                    {content}
                    {role === 'student' && courseWorkId && (
                        <button className={styles.selectButton} onClick={handleSelectCourseWork}>
                            Записаться
                        </button>
                    )}
                </div>
            </div>
        );
    };

        // Обработка клика по «чипу» тега
        const handleTagClick = (tag: string) => {
            setSelectedTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag) // убираем, если уже выбран
                : [...prev, tag]               // добавляем, если ещё не выбран
            );
        };

        // Получаем все уникальные названия тегов (предполагается, что в coursework.tags лежит {name} или просто строка)
        // Если у вас структура другая (например, tag: { id, name }), скорректируйте map.
        const uniqueTags = Array.from(
            new Set(courseworkList.flatMap((c) => c.tags.map((tag: any) => tag.name)))
        );

        // Фильтрация
        const filteredCoursework = courseworkList.filter((coursework) => {
            // 1. Фильтр по руководителю (если выбран конкретный)
            const matchesTeacher = selectedTeacher
              ? coursework.teacher.id.toString() === selectedTeacher
              : true;
        
            // 2. Фильтр по сложности (если выбрана конкретная)
            const matchesDifficulty = selectedDifficulty
              ? coursework.difficult === selectedDifficulty
              : true;
        
            // 3. Фильтр по тегам (если что-то выбрано)
            const matchesTags =
              selectedTags.length === 0
                ? true
                : coursework.tags.some((tag: any) => selectedTags.includes(tag.name));
        
            return matchesTeacher && matchesDifficulty && matchesTags;
          });


    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    const handleOpenModal = (coursework: Courswork) => {
        setModalContent(
            <div>
                <h2>{coursework.title}</h2>
                <p>{coursework.description}</p>
                <p>Сложность: {coursework.difficult}</p>
                <p>Руководитель: {coursework.teacher.lastName} {coursework.teacher.firstName.slice(0, 1)}. {coursework.teacher.surname.slice(0, 1)}.</p>
                <p>Свободных мест: {coursework.teacher.availableSlots}</p>
            </div>
        );
        setSelectedCourseWorkId(coursework.id);
        setShowModal(true);
    }

    return (
        <div className={styles.courseworkPage}>
            <Header/>
            <div className={styles.courseworkPageContainer}>
                <div className={styles.courseworkPageContainerLeft}>
                    <img src="myFirst.svg" alt="Image"/>
                </div>
                <div className={styles.courseworkPageContainerRight}>
                    <p className={styles.courseworkPageContainerRightTitle}>Еще не определились с темой итоговой работы? Давайте посмотрим, что предлагают ваши научные руководители.</p>
                    <br />
                    <p className={styles.courseworkPageContainerRightInfo}>На этой странице вы найдете темы созданные преподавателями вашего учебного заведения. Если у вас уже есть тема, обратитесь к куратору, к которому вы записаны или планируете записаться, он создаст индивидуальный план действий для успешной защиты проекта.</p>
                    <br />
                    <p className={styles.courseworkPageContainerRightInfo}>Как выбрать тему?</p>
                    <ol className={styles.courseworkPageContainerRightInfo} style={{paddingLeft: '25px'}}>
                        <li>Воспользуйтесь поиском по тегам, чтобы найти тему, которая вам интересна.</li>
                        <li>Отфильтруйте результаты по категории, сложности или области знаний.</li>
                        <li>Ознакомьтесь с описанием темы и рекомендациями куратора.</li>
                    </ol>
                </div>
            </div>
            <p className={styles.courseworkInfo}>Начните поиск прямо сейчас и сделайте шаг к успешной курсовой работе!</p>

            {/* Фильтры */}
            <div className={styles.filters}>
                <div className={styles.filterLabels}>
                    {/* Селект для руководителя */}
                    <label className={styles.filterLabel}>
                        Руководитель:
                        <select
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                        >
                            <option value="">Все</option>
                            {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.lastName} {teacher.firstName.slice(0, 1)}.{" "}
                                {teacher.surname.slice(0, 1)}.
                            </option>
                            ))}
                        </select>
                    </label>

                    {/* Селект для сложности */}
                    <label className={styles.filterLabel}>
                        Сложность:
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                        >
                            <option value="">Все</option>
                            <option value="Лёгкая">Лёгкая</option>
                            <option value="Средняя">Средняя</option>
                            <option value="Сложная">Сложная</option>
                        </select>
                    </label>
                </div>
                {/* Горизонтальный список «чипов» для тегов */}
                <div className={styles.tagCarousel}>
                    {uniqueTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                        <button
                            key={tag}
                            className={`${styles.tagButton} ${isSelected ? styles.selected : ""}`}
                            onClick={() => handleTagClick(tag)}
                            style={{ 
                            backgroundColor: getTagColor(tag),
                            opacity: isSelected ? 1 : 0.6,
                            }}
                        >
                            #{tag}
                            {isSelected && (
                                <span className={styles.minusCircle}>
                                    <span className={styles.minusSign}>-</span>
                                </span>
                            )}
                        </button>
                        );
                    })}
                </div>
            </div>

            <h1 className={styles.courseworkMainTitle}>Темы научных работ</h1>

            {/* Список курсовых */}
            <ul className={styles.courseworkList}>
                {filteredCoursework.map((coursework) => (
                    <li 
                        className={`${styles.courseworkItem} ${!coursework.isAvailable ? styles.disabled : ''}`} 
                        key={coursework.id}
                    >
                        <h3 className={styles.courseworkTitle}>{coursework.title}</h3>
                        <div className={styles.authorDifficultyRow}>
                            <p className={styles.courseworkAuthor}>
                                {coursework.teacher.lastName} {coursework.teacher.firstName.slice(0, 1)}. {coursework.teacher.surname.slice(0, 1)}.
                            </p>
                            <p className={styles.courseworkDifficulty}>
                                Сложность: <span className={styles[coursework.difficult]}>{coursework.difficult}</span>
                            </p>
                        </div>
                        <p className={styles.courseworkTags}>
                            {coursework.tags.map((tag: any) => (
                                <span 
                                key={tag.id} 
                                className={styles.courseworkTag} 
                                style={{ backgroundColor: getTagColor(tag.name) }}>
                                #{tag.name + ' '}
                                </span>
                            ))}
                        </p>
                        <button onClick={() => handleOpenModal(coursework)} className={styles.moreButton}>Подробнее</button>
                    </li>
                ))}
            </ul>
            {/* Footer */}
            <footer className="text-center py-6 text-gray-600">
                <Link href="#" className="hover:text-gray-950 hover:scale-105 transition-all duration-300">Безопасность </Link> 
                | 
                <Link href="#" className="hover:text-gray-950 hover:scale-105 transition-all duration-300"> Конфиденциальность </Link> 
                | 
                <Link href="#" className="hover:text-gray-950 hover:scale-105 transition-all duration-300"> Условия </Link>
            </footer>

            {/* Модальное окно */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                content={modalContent}
                role={userRole}
                courseWorkId={selectedCourseWorkId}
            />
        </div>
    );

};


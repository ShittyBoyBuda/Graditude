'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './MyWorkPage.module.css';
import Header from "../components/Header/Header";

interface CalendarEvent {
  id: number;
  type: string; // Например, "Теоретическая", "Практическая", "Предзащита", "Защита"
  startDate: string;
  endDate: string;
  googleEventId?: string;
}

interface Plan {
  id: number;
  title?: string | null; // Разрешить null
  structure: { // Добавить вложенность
    chapters: Array<{
      title: string;
      sections: string[];
    }>;
  };
}

interface Task {
  id?: number;
  description?: string;
  completed?: boolean;
}

interface Progress {
  id: number;
  fileType: string;
  fileLink: string;
  comments: string | null;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    surname: string;
    email: string;
  };
}

interface Tag {
  id: number;
  name: string;
}

interface CourseWork {
  id: number;
  title: string;
  description: string;
  teacher?: { id: number; firstName: string; lastName: string; surname: string };
  student?: { id: number; firstName: string; lastName: string; surname: string };
  deadline: string;
  tasks: string[];
  calendarEvents?: CalendarEvent[];
  difficult: string;
  tags: Tag[];
}

interface CourseWorkForm {
  title: string;
  description: string;
  difficult: string;
  tags: string[];
}

const MyWorkPage = () => {
  const [role, setRole] = useState<string | null>(null);
  const [courseWorks, setCourseWorks] = useState<CourseWork[] | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseWork | null>(null);
  const [initialCourse, setInitialCourse] = useState<CourseWork | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState<Progress[] | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null); // null - loading state
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editedPlan, setEditedPlan] = useState<Plan | null>(null);
  const [newPlan, setNewPlan] = useState(null);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourseWork, setNewCourseWork] = useState<CourseWorkForm>({
    title: '',
    description: '',
    difficult: 'Средняя',
    tags: []
  });
  const [newEvent, setNewEvent] = useState({
    type: '',
    startDate: '',
    endDate: '',
  });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isListVisible, setIsListVisible] = useState(true);


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

  const handleEditClick = () => {
    if (selectedCourse) {
      setInitialCourse({...selectedCourse });
      setIsEditing(true);
    }
  };

  const handleCancelClick = () => {
    if (initialCourse) {
      setSelectedCourse({...initialCourse });
    }
    setIsEditing(false);
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Пользователь не авторизован. Пожалуйста, войдите в систему.');
      setLoading(false);
      return;
    }

    try {
      // Извлечение роли пользователя из токена
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setRole(decodedToken.role);

      // Запрос к API для получения курсовых работ
      const response = await axios.get('http://localhost:3000/coursework/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourseWorks(response.data);
    } catch (err) {
      setError('Ошибка при загрузке данных. Пожалуйста, попробуйте снова.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Токен отсутствует');
        return;
      }

      // Отправка данных на сервер
      await axios.patch(
        `http://localhost:3000/coursework/${selectedCourse?.id}`,
        { title: selectedCourse?.title, description: selectedCourse?.description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Изменения сохранены');
      setIsEditing(false);

      // Обновление данных после сохранения
      fetchData(); // Перезапросить данные с сервера
    } catch (error) {
      console.error(error);
      alert('Ошибка при сохранении изменений');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Токен отсутствует');
      return;
    }
  
    // Явно указываем типы
    let targetCourse: CourseWork | undefined;
    if (role === 'student') {
      targetCourse = courseWorks?.[0]; // undefined если нет курсовой
    } else if (role === 'teacher') {
      targetCourse = selectedCourse || undefined; // конвертируем null в undefined
    }
  
    // Проверяем через Optional Chaining
    if (!targetCourse?.id) {
      alert('Курсовая работа не выбрана или не найдена');
      return;
    }
  
    // Получаем studentId в зависимости от роли
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const studentId = role === 'student' 
      ? decodedToken.sub 
      : targetCourse.student?.id;
  
    if (!studentId) {
      alert('Студент не найден');
      return;
    }
  
    const formData = new FormData();
    selectedFile && formData.append('file', selectedFile);
    formData.append('fileType', fileType);
    formData.append('comments', comments);
  
    try {
      await axios.post(
        `http://localhost:3000/progress/upload/${targetCourse.id}/${studentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      // Обновляем состояние после загрузки
      role === 'student' 
        ? fetchProgress(courseWorks?.[0]?.id!) 
        : fetchProgress(selectedCourse?.id!);
  
      setFileType('');
      setComments('');
      setSelectedFile(null);
      alert('Файл успешно загружен!');
    } catch (error: any) {
      console.error('Ошибка загрузки:', error);
      alert(error.response?.data?.message || 'Ошибка загрузки файла');
    }
  };

  const fetchProgress = async (courseWorkId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(
        `http://localhost:3000/progress/${courseWorkId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProgress(response.data);
      setProgressError(null);
    } catch (err) {
      setProgress([]);
      setProgressError('Прогресс не найден.');
    }
  };

  const fetchCalendarEvents = async (courseWorkId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const response = await axios.get(
        `http://localhost:3000/coursework/${courseWorkId}/calendar`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCalendarEvents(response.data);
      setError(null);
    } catch (err) {
      setCalendarEvents([]);
      setError('События календаря не найдены.');
      console.error(err);
    }
  };
  

  const handleCourseClick = (courseWork: CourseWork) => {
    setSelectedCourse(courseWork);
    fetchProgress(courseWork.id);
    fetchPlan(courseWork.id);
    fetchTasks(courseWork.id);
    fetchCalendarEvents(courseWork.id);
  };

  useEffect(() => {
    if (role === 'student' && courseWorks?.[0]) {
      const courseWorkId = courseWorks[0].id;
      fetchCalendarEvents(courseWorkId);
      fetchProgress(courseWorkId);
      fetchPlan(courseWorkId);
      fetchTasks(courseWorkId);    }
  }, [courseWorks, role]); // Добавляем зависимости

  const fetchPlan = async (courseWorkId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`http://localhost:3000/plan/${courseWorkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlan(response.data);
    } catch (error) {
      console.error('Ошибка загрузки плана:', error);
    }
  };

  const fetchTasks = async (courseWorkId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const response = await axios.get(
        `http://localhost:3000/task/${courseWorkId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(response.data || []);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
      setTasks(null); // Явное указание на ошибку
    }
  };

  const handleTaskToggle = async (taskId: number, completed: boolean) => {
    const token = localStorage.getItem('token');
    if (!token || !tasks) return;
  
    // Сохраняем текущие задачи для отката
    const originalTasks = [...tasks];
  
    try {
      // Оптимистичное обновление UI
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      );
      setTasks(updatedTasks);
  
      // Отправка изменения на сервер
      await axios.patch(
        `http://localhost:3000/task/${taskId}`,
        { completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Дополнительная проверка актуальности данных
      if (selectedCourse) {
        const freshTasks = await axios.get<Task[]>(
          `http://localhost:3000/task/${selectedCourse.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks(freshTasks.data);
      }
    } catch (error) {
      // Откат при ошибке
      setTasks(originalTasks);
      console.error('Ошибка обновления задачи:', error);
      alert('Не удалось обновить статус задачи');
    }
  };

  const handleSavePlan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен отсутствует');
  
      await axios.patch(
        `http://localhost:3000/plan/${selectedCourse?.id}/plan`,
        { structure: editedPlan?.structure },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setPlan(editedPlan);
      setIsEditingPlan(false);
      alert('План успешно обновлен!');
    } catch (error) {
      console.error('Ошибка обновления плана:', error);
      alert('Не удалось обновить план');
    }
  };
  
  const handleCreatePlan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен отсутствует');
  
      // Пустая структура для нового плана
      const emptyStructure = {
        chapters: [{ title: 'Новая глава', sections: ['Новый раздел'] }]
      };
  
      const response = await axios.post(
        `http://localhost:3000/plan/${selectedCourse?.id}`,
        { structure: emptyStructure },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Обновляем состояние с новым планом
      setPlan(response.data);
      setNewPlan(null);
      alert('План успешно создан!');
      
      // Автоматически переходим в режим редактирования
      setIsEditingPlan(true);
      setEditedPlan(response.data);
  
    } catch (error: any) {
      console.error('Ошибка создания плана:', error);
      alert(error.response?.data?.message || 'Не удалось создать план');
    }
  };

  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен отсутствует');
      
      // Проверяем заполнение описания
      if (!newTaskDescription.trim()) {
        alert('Введите описание задачи');
        return;
      }
  
      const response = await axios.post(
        `http://localhost:3000/task/${selectedCourse?.id}`,
        { description: newTaskDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Обновляем список задач
      setTasks(prev => [...(prev || []), response.data]);
      setNewTaskDescription(''); // Очищаем поле ввода
      alert('Задача успешно создана!');
  
    } catch (error: any) {
      console.error('Ошибка создания задачи:', error);
      alert(error.response?.data?.message || 'Не удалось создать задачу');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен отсутствует');
  
      await axios.delete(
        `http://localhost:3000/task/${selectedCourse?.id}/task/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setTasks(prev => prev ? prev.filter(t => t.id !== taskId) : null);
      alert('Задача успешно удалена!');
    } catch (error: any) {
      console.error('Ошибка удаления задачи:', error);
      alert(error.response?.data?.message || 'Не удалось удалить задачу');
    }
  };

  const handleDeleteProgress = async (progressId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен отсутствует');
  
      if (!window.confirm('Вы уверены, что хотите удалить эту запись прогресса?')) return;
  
      await axios.delete(
        `http://localhost:3000/progress/${progressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setProgress(prev => prev ? prev.filter(p => p.id !== progressId) : null);
      alert('Запись прогресса успешно удалена!');
    } catch (error: any) {
      console.error('Ошибка удаления прогресса:', error);
      alert(error.response?.data?.message || 'Не удалось удалить запись прогресса');
    }
  };

  const handleCreateCourseWork = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен отсутствует');

      const response = await axios.post(
        'http://localhost:3000/coursework',
        newCourseWork,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourseWorks(prev => prev ? [...prev, response.data] : [response.data]);
      setIsModalOpen(false);
      alert('Курсовая работа успешно создана!');
    } catch (error: any) {
      console.error('Ошибка создания:', error);
      alert(error.response?.data?.message || 'Ошибка создания курсовой работы');
    }
  };

  const handleDeleteCourseWork = async (courseWorkId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен отсутствует');
  
      if (!window.confirm('Вы уверены, что хотите удалить эту курсовую работу?')) return;
  
      await axios.delete(
        `http://localhost:3000/coursework/${courseWorkId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setCourseWorks(prev => prev ? prev.filter(cw => cw.id !== courseWorkId) : null);
      alert('Курсовая работа успешно удалена!');
    } catch (error: any) {
      console.error('Ошибка удаления:', error);
      alert(error.response?.data?.message || 'Не удалось удалить курсовую работу');
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен отсутствует');

      const response = await axios.get('http://localhost:3000/coursework/export', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      const blob = response.data;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'courseworks.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }

  const handleCreateCalendarEvent = async () => {
    const token = localStorage.getItem('token');
    if (!token || !selectedCourse) return;
    try {
      const response = await axios.post(
        `http://localhost:3000/coursework/${selectedCourse.id}/calendar`,
        newEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Обновляем список событий в выбранной курсовой работе
      setCalendarEvents(prevEvents => [...prevEvents, response.data]);
      alert("Событие успешно создано!");
      // Очищаем форму
      setNewEvent({ type: '', startDate: '', endDate: '' });
    } catch (error: any) {
      console.error(error.message);
      alert("Ошибка при создании события");
    }
  };

  const fetchTeacherId = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Токен отсутствует');
    const response = await axios.get('http://localhost:3000/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.teacherId;
  };
  

  const handleGoogleAuth = async () => {
    try {
      // Получаем teacherId по JWT
      const teacherId = await fetchTeacherId();
      // Получаем URL для Google OAuth
      const response = await axios.get(`http://localhost:3000/auth/google-init?teacherId=${teacherId}`);
      const googleUrl = response.data.url;
      // Перенаправляем пользователя на Google OAuth
      window.location.href = googleUrl;
    } catch (error: any) {
      console.error(error.message);
    }
  };
 
  

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!courseWorks) {
    return <p>Данные не найдены</p>;
  }

  const currentCourseWork = role === 'teacher' ? selectedCourse : courseWorks[0];

  if (role === 'student') {
    const courseWork = courseWorks[0];
    console.log(courseWork);

    const handleSaveStudentPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Токен отсутствует');
    
        if (!courseWork || !courseWork.id) {
          alert('Курсовая работа не выбрана');
          return;
        }
    
        await axios.patch(
          `http://localhost:3000/plan/${courseWork.id}/plan`,
          { structure: editedPlan?.structure },
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        setPlan(editedPlan);
        setIsEditingPlan(false);
        alert('План успешно обновлен!');
      } catch (error) {
        console.error('Ошибка обновления плана:', error);
        alert('Не удалось обновить план');
      }
    };

    const handleCreateStudentTask = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Токен отсутствует');
        
        // Проверяем, что описание задачи заполнено
        if (!newTaskDescription.trim()) {
          alert('Введите описание задачи');
          return;
        }
    
        const response = await axios.post(
          `http://localhost:3000/task/${courseWork.id}`,
          { description: newTaskDescription },
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        // Обновляем список задач
        setTasks(prev => [...(prev || []), response.data]);
        setNewTaskDescription(''); // Очищаем поле ввода
        alert('Задача успешно создана!');
      } catch (error: any) {
        console.error('Ошибка создания задачи:', error);
        alert(error.response?.data?.message || 'Не удалось создать задачу');
      }
    };

    const handleDeleteStudentTask = async (taskId: number) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Токен отсутствует');
    
        await axios.delete(
          `http://localhost:3000/task/${courseWork.id}/task/${taskId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        setTasks(prev => prev ? prev.filter(t => t.id !== taskId) : null);
        alert('Задача успешно удалена!');
      } catch (error: any) {
        console.error('Ошибка удаления задачи:', error);
        alert(error.response?.data?.message || 'Не удалось удалить задачу');
      }
    };
    

    if (!courseWork) {
      return (
        <div className={styles.page}>
          <Header/>
          <h1 className={styles.title}>Моя курсовая работа</h1>
          <p className={styles.description}>Вы не выбрали курсовую работу.</p>
        </div>
      );
    }
  
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.twoColumnContainer}>
          {/* Левая колонка */}
          <div className={styles.leftColumn}>
            <h1 className={styles.title}>{courseWork.title}</h1>
            <p className={styles.description}>{courseWork.description}</p>
    
            {plan && (
              <button
                onClick={() => {
                  setIsEditingPlan(true);
                  setEditedPlan(plan);
                }}
                className={styles.editButton}
              >
                Редактировать план
              </button>
            )}
    
            {isEditingPlan && editedPlan && (
              <div className={styles.editSection}>
                <h3>Редактирование плана</h3>
                {editedPlan.structure.chapters.map((chapter, chapterIdx) => (
                  <div key={chapterIdx} className={styles.editChapter}>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => {
                        const updatedChapters = [...editedPlan.structure.chapters];
                        updatedChapters[chapterIdx].title = e.target.value;
                        setEditedPlan({
                          ...editedPlan,
                          structure: { chapters: updatedChapters },
                        });
                      }}
                      placeholder="Название главы"
                    />
                    <button
                      onClick={() => {
                        const updatedChapters = editedPlan.structure.chapters.filter(
                          (_, idx) => idx !== chapterIdx
                        );
                        setEditedPlan({
                          ...editedPlan,
                          structure: { chapters: updatedChapters },
                        });
                      }}
                      className={styles.deleteButton}
                    >
                      Удалить главу
                    </button>
                  </div>
                ))}
                <button onClick={handleSaveStudentPlan} className={styles.saveButton}>
                  Сохранить изменения
                </button>
                <button onClick={() => setIsEditingPlan(false)} className={styles.cancelButton}>
                  Отмена
                </button>
              </div>
            )}
    
            {plan?.structure?.chapters ? (
              <div className={styles.section}>
                <h3 className={styles.title}>{plan.title || 'План работы'}</h3>
                <div className={styles.plan}>
                  {plan.structure.chapters.map((chapter, idx) => (
                    <div key={idx} className={styles.chapter}>
                      <h4>{chapter.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.section}>
                <p className={styles.empty}>План пока не добавлен</p>
              </div>
            )}
    
            {/* Задачи */}
            <div className={styles.section}>
              <h3 className={styles.title}>Задачи</h3>
              <div className={styles.taskCreate}>
                <input
                  type="text"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Новая задача"
                  className={styles.taskInput}
                />
                <button
                  onClick={handleCreateStudentTask}
                  className={styles.addButton}
                  disabled={!newTaskDescription.trim()}
                >
                  Добавить задачу
                </button>
              </div>
            </div>
            {/* Блок для дат сдачи */}
            <div className={styles.section}>
              <h3 className={styles.title}>Даты сдачи</h3>
              {/* Здесь можно вывести даты сдачи, если они присутствуют в данных */}
              {calendarEvents && calendarEvents.length > 0 && (
              <div className={styles.calendarEvents}>
                {calendarEvents.map((event) => (
                  <div key={event.id} className={styles.calendarEventItem}>
                    <p>
                      {event.type} с {new Date(event.startDate).toLocaleString()} по{' '}
                      {new Date(event.endDate).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

    
          {/* Правая колонка */}
          <div className={styles.rightColumn}>
            <img src="myImg.svg" alt="Image" />
            <div className={styles.section}>
              <h3 className={styles.title}>Сведения</h3>
              <p>
                Научный руководитель: {courseWork.teacher?.lastName}{' '} {courseWork.teacher?.firstName.slice(0, 1)}. {courseWork.teacher?.surname.slice(0, 1)}.
              </p>
              <p>
                Сложность: <span className={styles[courseWork.difficult]}>{courseWork.difficult}</span>
              </p>
              {/* Контейнер для тегов */}
              <div className={styles.tagContainer}>
                {courseWork.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    style={{
                      backgroundColor: getTagColor(tag.name),
                      color: "#000",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      marginRight: "10px",
                      display: "inline-block",
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>

            {calendarEvents && calendarEvents.length > 0 && (
              <div className={styles.calendarEvents}>
                <h3>События календаря</h3>
                {calendarEvents.map((event: CalendarEvent) => (
                  <div key={event.id} className={styles.calendarEventItem}>
                    <p>
                      {event.type} с {new Date(event.startDate).toLocaleString()} по {new Date(event.endDate).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
    
            {/* Форма загрузки файлов */}
            <div className={styles.uploadSection}>
              <h4>Загрузить новый файл</h4>
              <form onSubmit={handleUpload} className={styles.uploadForm}>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="">Выберите тип файла</option>
                  <option value="document">Документ</option>
                  <option value="image">Изображение</option>
                </select>
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Комментарий"
                  className={styles.input}
                />
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className={styles.fileInput}
                  required
                />
                <button type="submit" className={styles.uploadButton}>
                  Загрузить
                </button>
              </form>
            </div>
    
            {/* Прогресс */}
            <h3 className={styles.title}>Мой прогресс</h3>
            {progressError ? (
              <p className={styles.error}>{progressError}</p>
            ) : progress ? (
              progress.map((item) => (
                <div key={item.id} className={styles.progressItem}>
                  <button
                    onClick={() => handleDeleteProgress(item.id)}
                    className={styles.deleteButtonProgress}
                    title="Удалить запись прогресса"
                  >
                    ×
                  </button>
                  {item.fileType === 'image' ? (
                    <div className={styles.imageContainer}>
                      <img
                        src={`http://localhost:3000${item.fileLink}`}
                        alt="Прогресс"
                        className={styles.progressImage}
                        onClick={() => window.open(`http://localhost:3000${item.fileLink}`, '_blank')}
                      />
                      <span className={styles.zoomHint}>Кликните для увеличения</span>
                    </div>
                  ) : (
                    <a
                      href={`http://localhost:3000${item.fileLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.progressLink}
                    >
                      Скачать файл
                    </a>
                  )}
                  <div className={styles.comment}>{item.comments || 'Комментарии отсутствуют'}</div>
                </div>
              ))
            ) : (
              <p>Прогресс пока отсутствует</p>
            )}
          </div>
        </div>
      </div>
    );
    
  }

  return (
    <div className={styles.page}>
      <Header />
      <h1 className={styles.MainTitle}>Мои курсовые работы</h1>
      <button onClick={() => setIsModalOpen(true)} className={styles.addButtonModal}>
        Создать курсовую
      </button>
      <button className={styles.toggleButton} onClick={handleExportExcel}>Выгрузить в Excel</button>
  
      {/* Модальное окно */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Новая курсовая работа</h2>
            <div className={styles.formGroup}>
              <label>Название:</label>
              <input
                type="text"
                value={newCourseWork.title}
                onChange={(e) =>
                  setNewCourseWork((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label>Описание:</label>
              <textarea
                value={newCourseWork.description}
                onChange={(e) =>
                  setNewCourseWork((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label>Сложность:</label>
              <select
                value={newCourseWork.difficult}
                onChange={(e) =>
                  setNewCourseWork((prev) => ({ ...prev, difficult: e.target.value }))
                }
              >
                <option value="Лёгкая">Лёгкая</option>
                <option value="Средняя">Средняя</option>
                <option value="Сложная">Сложная</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Теги (через запятую):</label>
              <input
                type="text"
                value={newCourseWork.tags.join(', ')}
                onChange={(e) =>
                  setNewCourseWork((prev) => ({
                    ...prev,
                    tags: e.target.value.split(',').map((t) => t.trim()),
                  }))
                }
              />
            </div>
            <div className={styles.modalButtons}>
              <button onClick={handleCreateCourseWork} className={styles.saveButtonModal}>
                Сохранить
              </button>
              <button onClick={() => setIsModalOpen(false)} className={styles.cancelButtonModal}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsListVisible(!isListVisible)}
        className={styles.toggleButton}
      >
        {isListVisible ? 'Скрыть список' : 'Показать список'}
      </button>
  
      {isListVisible && (
        <ul className={styles.list}>
          {courseWorks.map((courseWork) => (
            <li
              key={courseWork.id}
              onClick={() => handleCourseClick(courseWork)}
              className={styles.listItem}
            >
              {courseWork.title}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCourseWork(courseWork.id);
                }}
                className={styles.deleteButtonCourse}
                title="Удалить курсовую работу"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
  
      {selectedCourse && (
        <div className={styles.twoColumnContainer}>
          {/* Левая колонка */}
          <div className={styles.leftColumn}>
            <h2 className={styles.CourseWorkTitle}>
              {isEditing ? 'Редактирование курсовой работы' : selectedCourse.title}
            </h2>
  
            {!isEditing ? (
              <div>
                <p className={styles.CourseWorkDescription}>
                  Цель работы: {selectedCourse.description}
                </p>
                <p className={styles.subText}>
                  {/* Можно добавить дату сдачи, если она есть */}
                  {/* Дата сдачи: {selectedCourse.deadline || 'Не указана'} */}
                </p>
                <button onClick={handleEditClick}>Редактировать</button>
              </div>
            ) : (
              <div className={styles.form}>
                <label className={styles.label}>
                  Название:
                  <input
                    className={styles.input}
                    type="text"
                    value={selectedCourse.title}
                    onChange={(e) =>
                      setSelectedCourse({ ...selectedCourse, title: e.target.value })
                    }
                  />
                </label>
                <label className={styles.label}>
                  Описание:
                  <textarea
                    className={styles.textarea}
                    value={selectedCourse.description}
                    onChange={(e) =>
                      setSelectedCourse({ ...selectedCourse, description: e.target.value })
                    }
                  />
                </label>
                <div className={styles.buttonGroup}>
                  <button className={styles.saveButton} onClick={handleSaveClick}>
                    Сохранить
                  </button>
                  <button className={styles.cancelButton} onClick={handleCancelClick}>
                    Отмена
                  </button>
                </div>
              </div>
            )}
  
            {/* План работы */}
            {!plan ? (
              <button onClick={handleCreatePlan} className={styles.addButton}>
                Создать новый план
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditingPlan(true);
                  setEditedPlan(plan);
                }}
                className={styles.editButton}
              >
                Редактировать план
              </button>
            )}
  
            {isEditingPlan && editedPlan && (
              <div className={styles.editSection}>
                <h3>Редактирование плана</h3>
                {editedPlan.structure.chapters.map((chapter, chapterIdx) => (
                  <div key={chapterIdx} className={styles.editChapter}>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => {
                        const updatedChapters = [...editedPlan.structure.chapters];
                        updatedChapters[chapterIdx].title = e.target.value;
                        setEditedPlan({ ...editedPlan, structure: { chapters: updatedChapters } });
                      }}
                      placeholder="Название главы"
                    />
                    <button
                      onClick={() => {
                        const updatedChapters = editedPlan.structure.chapters.filter(
                          (_, idx) => idx !== chapterIdx
                        );
                        setEditedPlan({ ...editedPlan, structure: { chapters: updatedChapters } });
                      }}
                      className={styles.deleteButton}
                    >
                      Удалить главу
                    </button>
                    <ul>
                      {chapter.sections.map((section, sectionIdx) => (
                        <li key={sectionIdx}>
                          <input
                            type="text"
                            value={section}
                            onChange={(e) => {
                              const updatedChapters = [...editedPlan.structure.chapters];
                              updatedChapters[chapterIdx].sections[sectionIdx] = e.target.value;
                              setEditedPlan({ ...editedPlan, structure: { chapters: updatedChapters } });
                            }}
                            placeholder="Название раздела"
                          />
                          <button
                            onClick={() => {
                              const updatedSections = chapter.sections.filter(
                                (_, idx) => idx !== sectionIdx
                              );
                              const updatedChapters = [...editedPlan.structure.chapters];
                              updatedChapters[chapterIdx].sections = updatedSections;
                              setEditedPlan({ ...editedPlan, structure: { chapters: updatedChapters } });
                            }}
                            className={styles.deleteButton}
                          >
                            Удалить раздел
                          </button>
                        </li>
                      ))}
                      <button
                        onClick={() => {
                          const updatedChapters = [...editedPlan.structure.chapters];
                          updatedChapters[chapterIdx].sections.push('');
                          setEditedPlan({ ...editedPlan, structure: { chapters: updatedChapters } });
                        }}
                        className={styles.addButton}
                      >
                        Добавить раздел
                      </button>
                    </ul>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const updatedChapters = [...editedPlan.structure.chapters];
                    updatedChapters.push({ title: '', sections: [] });
                    setEditedPlan({ ...editedPlan, structure: { chapters: updatedChapters } });
                  }}
                  className={styles.addButton}
                >
                  Добавить главу
                </button>
                <button onClick={handleSavePlan} className={styles.saveButton}>
                  Сохранить изменения
                </button>
                <button onClick={() => setIsEditingPlan(false)} className={styles.cancelButton}>
                  Отмена
                </button>
              </div>
            )}
  
            {plan?.structure?.chapters ? (
              <div className={styles.section}>
                <h3 className={styles.title}>{plan.title || "План работы"}</h3>
                <div className={styles.plan}>
                  {plan.structure.chapters.map((chapter, idx) => (
                    <div key={idx} className={styles.chapter}>
                      <h4>{chapter.title}</h4>
                      <ul>
                        {chapter.sections.map((section, secIdx) => (
                          <li key={secIdx}>{section}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.section}>
                <p className={styles.empty}>План пока не добавлен</p>
              </div>
            )}
  
            <div className={styles.section}>
              <h3 className={styles.title}>Задачи</h3>
              <div className={styles.taskCreate}>
                <input
                  type="text"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Новая задача"
                  className={styles.taskInput}
                />
                <button
                  onClick={handleCreateTask}
                  className={styles.addButton}
                  disabled={!newTaskDescription.trim()}
                >
                  Добавить задачу
                </button>
              </div>
              {tasks && tasks.length > 0 ? (
                <div className={styles.tasks}>
                  {tasks.map((task) => (
                    <div key={task.id} className={styles.task}>
                      <input
                        type="checkbox"
                        checked={task.completed || false}
                        onChange={(e) =>
                          task.id && handleTaskToggle(task.id, e.target.checked)
                        }
                        disabled={!task.id}
                      />
                      <span className={task.completed ? styles.completed : ''}>
                        {task.description || "Без описания"}
                      </span>
                      <button
                        onClick={() => task.id && handleDeleteTask(task.id)}
                        className={styles.deleteTaskButton}
                        disabled={!task.id}
                        title={!task.id ? 'Сначала сохраните задачу' : 'Удалите задачу'}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>
                  {tasks === null ? 'Ошибка загрузки задач' : 'Задачи пока не добавлены'}
                </p>
              )}
            </div>
  
            {/* Блок для дат сдачи */}
            <div className={styles.section}>
              <h3 className={styles.title}>Даты сдачи</h3>
              {/* Здесь можно вывести даты сдачи, если они присутствуют в данных */}
              {calendarEvents && calendarEvents.length > 0 && (
              <div className={styles.calendarEvents}>
                {calendarEvents.map((event) => (
                  <div key={event.id} className={styles.calendarEventItem}>
                    <p>
                      {event.type} с {new Date(event.startDate).toLocaleString()} по{' '}
                      {new Date(event.endDate).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
          
          {/* Правая колонка */}
          <div className={styles.rightColumn}>
            <img src="myImg.svg" alt="Image" />
            <div className={styles.section}>
              <h3 className={styles.title}>Сведения</h3>
              <p>
                Студент: {selectedCourse.student?.lastName} {selectedCourse.student?.firstName}
              </p>
              <p>
                Сложность: <span className={styles[selectedCourse.difficult]}>{selectedCourse.difficult}</span>
              </p>
              {/* Контейнер для тегов */}
              <div className={styles.tagContainer}>
                {selectedCourse.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    style={{
                      backgroundColor: getTagColor(tag.name),
                      color: "#000",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      marginRight: "10px",
                      display: "inline-block",
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
  
            {role === 'teacher' && !currentCourseWork?.calendarEvents?.length && (
              <button onClick={handleGoogleAuth} className={styles.googleAuthButton}>
                Привязать Google Calendar
              </button>
            )}
            {role === 'teacher' && (
              <div className={styles.calendarEventForm}>
                <h3>Создать событие</h3>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                >
                  <option value="">Выберите тип события</option>
                  <option value="Теоретическая">Теоретическая</option>
                  <option value="Практическая">Практическая</option>
                  <option value="Предзащита">Предзащита</option>
                  <option value="Защита">Защита</option>
                </select>
                <input
                  type="datetime-local"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                />
                <input
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                />
                <button onClick={handleCreateCalendarEvent}>Создать событие</button>
              </div>
            )}
  
            {calendarEvents && calendarEvents.length > 0 && (
              <div className={styles.calendarEvents}>
                <h3>События календаря</h3>
                {calendarEvents.map((event) => (
                  <div key={event.id} className={styles.calendarEventItem}>
                    <p>
                      {event.type} с {new Date(event.startDate).toLocaleString()} по{' '}
                      {new Date(event.endDate).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
  
            <div className={styles.uploadSection}>
              <h4>Загрузить новый файл</h4>
              <form onSubmit={handleUpload} className={styles.uploadForm}>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="">Выберите тип файла</option>
                  <option value="document">Документ</option>
                  <option value="image">Изображение</option>
                </select>
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Комментарий"
                  className={styles.input}
                />
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className={styles.fileInput}
                  required
                />
                <button type="submit" className={styles.uploadButton}>
                  Загрузить
                </button>
              </form>
            </div>
  
            <h3 className={styles.title}>Прогресс</h3>
            {progressError ? (
              <p>{progressError}</p>
            ) : (
              progress &&
              progress.map((item) => (
                <div key={item.id} className={styles.progressItem}>
                  <button
                    onClick={() => handleDeleteProgress(item.id)}
                    className={styles.deleteButtonProgress}
                    title="Удалить запись прогресса"
                  >
                    ×
                  </button>
                  {item.fileType === 'image' ? (
                    <div className={styles.imageContainer}>
                      <img
                        src={`http://localhost:3000${item.fileLink}`}
                        alt="Прогресс"
                        className={styles.progressImage}
                        onClick={() =>
                          window.open(`http://localhost:3000${item.fileLink}`, '_blank')
                        }
                      />
                      <span className={styles.zoomHint}>Кликните для увеличения</span>
                    </div>
                  ) : (
                    <a
                      href={`http://localhost:3000${item.fileLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.progressLink}
                    >
                      Скачать файл
                    </a>
                  )}
                  <p>{item.comments || 'Нет комментариев'}</p>
                  <p>
                    Загрузка: {item.student.lastName} {item.student.firstName}{' '}
                    {item.student.surname}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
  
};

export default MyWorkPage;

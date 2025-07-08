'use client';

// pages/chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import Header from "../components/Header/Header";
import axios from 'axios';
import { group } from 'console';
import { io, Socket } from 'socket.io-client';


// Настройка axios
const api = axios.create({
  baseURL: 'http://localhost:3000', // Замените на адрес вашего бэкенда
});

// Функция для декодирования JWT (упрощённый вариант, не для продакшена)
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const ChatPage = () => {
  const [chatList, setChatList] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [teacherStudents, setTeacherStudents] = useState<any[]>([]);

  const [socket, setSocket] = useState<Socket | null>(null);

  const [allMessages, setAllMessages] = useState<any>({}); // Состояние для хранения всех сообщений


  // Инициализация WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      const newSocket = io('http://localhost:3000', {
        auth: {
          token: token,
        },
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
        newSocket.emit('joinChat', user.sub); // Присоединяем пользователя к чату
      });

      // Обработка входящих личных сообщений
      newSocket.on('receiveMessage', (message: any) => {
        handleIncomingMessage(message);
      });

      // Обработка входящих групповых сообщений
      newSocket.on(`groupMessage`, (message: any) => {
        handleIncomingMessage(message);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const activeChatRef = useRef<typeof activeChat>();


  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);


  // Обрабатываем входящие сообщения
  const handleIncomingMessage = (message: any) => {
    let chatId: number | string;

    
    if (message.hasOwnProperty('chatGroup')) {
      chatId = `group_${message.chatGroup.id}`;
      console.log(chatId);
    } else {
      // Извлекаем id преподавателя и студента независимо от роли отправителя
      const teacherId = message.senderTeacher?.id || message.receiverTeacher?.id;
      const studentId = message.senderStudent?.id || message.receiverStudent?.id;
      
      // Если оба идентификатора существуют, формируем единый chatId
      if (teacherId && studentId) {
        chatId = `${teacherId}_${studentId}`;
      } else {
        // Если какая-либо из ролей не определена — используем запасной вариант
        chatId = message.receiverId || message.senderId;
      }
    }

      setAllMessages((prevAllMessages: any) => {
        const chatMessages = prevAllMessages[chatId] || [];
        // Проверяем, если сообщение уже есть, не добавляем повторно
        if (!chatMessages.some((msg: any) => msg.id === message.id)) {
          return {
            ...prevAllMessages,
            [chatId]: [...chatMessages, message],
          };
        }
        return prevAllMessages;
      });

      // В handleIncomingMessage:
      if (activeChatRef.current?.chatId === chatId) {
        setMessages((prevMessages: any) => {
          if (!prevMessages.some((msg: any) => msg.id === message.id)) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
    }
  };


  // При монтировании компонента получаем данные пользователя из JWT, сохранённого в localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setUser(payload);
    }
  }, []);

  // Получаем все личные сообщения и, если преподаватель, список учеников
  useEffect(() => {
    if (user) {
      // Сначала получаем личные сообщения
      api
        .get('/messages/private', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((res) => {
          const msgs = res.data;
          // Группировка сообщений по собеседнику
          const conv: { [key: string]: any } = {};

          msgs.forEach((msg: any) => {
            let correspondent = null;

            if (user.role === 'student') {
              // Для студента собеседником является преподаватель
              if (msg.senderTeacher && msg.senderTeacher.id !== user.id) {
                correspondent = msg.senderTeacher;
              } else if (msg.receiverTeacher && msg.receiverTeacher.id !== user.id) {
                correspondent = msg.receiverTeacher;
              }
            } else if (user.role === 'teacher') {
              // Для преподавателя собеседником является студент
              if (msg.senderStudent && msg.senderStudent.id !== user.id) {
                correspondent = msg.senderStudent;
              } else if (msg.receiverStudent && msg.receiverStudent.id !== user.id) {
                correspondent = msg.receiverStudent;
              }
            }

            if (correspondent) {
              if (!conv[correspondent.id]) {
                conv[correspondent.id] = {
                  correspondent,
                  messages: [],
                };
              }
              conv[correspondent.id].messages.push(msg);
            }
          });

          api.get('messages/groups', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
          .then((res) => {
            res.data.forEach((group: any) => {
              const groupName = group.name || `Группа ${group.teacher.lastName}`;
              conv[`group_${group.id}`] = {
                correspondent: { id: group.id, name: groupName },
                messages: group.messages,
                isGroup: true,
              };
            });
            setChatList(Object.values(conv));
          })
          .catch((err: any) => console.error(err));

          // Если пользователь — преподаватель, дополнительно получаем всех его учеников
          if (user.role === 'teacher') {
            api
              .get('/teachers/students', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              })
              .then((res2) => {
                const allStudents = res2.data; // Массив учеников
                // Для каждого ученика, если переписки ещё нет, добавляем пустой объект переписки
                allStudents.forEach((student: any) => {
                  if (!conv[student.id]) {
                    conv[student.id] = {
                      correspondent: student,
                      messages: [],
                    };
                  }
                });
                setChatList(Object.values(conv));
              })
              .catch((err) => {
                console.error('Ошибка при получении учеников', err);
                // Даже если запрос не удался, отображаем имеющиеся переписки
                setChatList(Object.values(conv));
              });
          } else {
            // Для студентов просто отображаем переписки (обычно их руководитель всего один)
            setChatList(Object.values(conv));
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const fetchChats = () => {
    if (user) {
      api.get('/messages/groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        setChatList(prevChats => {
          // Фильтруем старые групповые чаты
          const filtered = prevChats.filter(chat => !chat.isGroup);
          // Создаем новые групповые чаты
          const newGroupChats = res.data.map((group: any) => ({
            correspondent: { 
              id: group.id, 
              name: group.name || `Группа ${group.teacher.lastName}`
            },
            messages: group.messages,
            isGroup: true,
          }));
          // Объединяем личные чаты с новыми группами
          return [...filtered, ...newGroupChats];
        });
      })
      .catch((err) => console.error('Ошибка при обновлении чатов', err));
    }
  };

  // При выборе контакта отображаем его переписку
  const loadConversation = (chat: any) => {
    let chatId: string;
    
    // Если это групповой чат
    if (chat.isGroup) {
      chatId = `group_${chat.correspondent.id}`;
    } 
    // Если это личный чат
    else {
        // ID собеседника (correspondent)
        const correspondentId = chat.correspondent?.id;

        // ID текущего пользователя (из пропсов/контекста)
        const currentUser = user.sub;

        // Сортируем ID, чтобы порядок не влиял
        const ids = [correspondentId, currentUser]
            .filter(Boolean)
            .sort((a, b) => a - b);

        chatId = ids.join('_');
    }

    console.log(chatId);
    
    
    // Сохраняем активный чат, добавляя chatId для дальнейшего сравнения
    setActiveChat({ ...chat, chatId });
  
    if (allMessages[chatId]) {
      setMessages(allMessages[chatId]);
    } else {
      const sortedMessages = chat.messages.sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  
      setAllMessages((prevAllMessages: any) => ({
        ...prevAllMessages,
        [chatId]: sortedMessages,
      }));
  
      setMessages(sortedMessages);
    }
  };
  

// При отправке сообщения
const sendMessage = () => {
    if (!activeChat || !newMessage.trim()) return;

    // Определяем получателя (объект из списка контактов)
    const receiver = activeChat.correspondent;
  
    // Явно определяем роль получателя:
    const receiverRole = user.role === 'teacher' ? 'student' : 'teacher';
  
    const payload = {
      content: newMessage,
      receiverId: receiver.id,
      receiverRole: receiverRole, // Явно задаём роль получателя
    };
  
    api
      .post('/messages/private', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        const chatId = receiver.id;

        setAllMessages((prevAllMessages: any) => ({
          ...prevAllMessages,
          [chatId]: [...(prevAllMessages[chatId] || []), res.data],
        }));

        // Добавляем отправленное сообщение в текущую переписку
        setMessages((prevMessages) => {
          if (!prevMessages.some((msg: any) => msg.id === res.data.id)) {
            return [...prevMessages, res.data];
          }
          return prevMessages;
        });
        setNewMessage('');

        if (socket) {
          socket.emit('sendMessage', {
            receiverId: receiver.id,
            messages: res.data,
          });
        }
      })
      .catch((err) => console.error(err));
  };

  const sendGroupMessage = () => {
    if (!activeChat || !newMessage.trim()) return;

    const payload = {
        content: newMessage,
    };
    api.post(`/messages/groups/${activeChat.correspondent.id}/messages`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
        .then((res) => {
          const chatId = `group_${activeChat.correspondent.id}`;

          setAllMessages((prevAllMessages: any) => ({
            ...prevAllMessages,
            [chatId]: [...(prevAllMessages[chatId] || []), res.data],
          }));

          setMessages((prevMessages) => {
            if (!prevMessages.some((msg: any) => msg.id === res.data.id)) {
              return [...prevMessages, res.data];
            }
            return prevMessages;
          });
            setNewMessage('');

            if (socket) {
              socket.emit('sendGroupMessage', {
                groupId: activeChat.correspondent.id,
                message: res.data,
              });
            }
        })
        .catch((err) => console.error(err));
};

useEffect(() => {
  if (isCreatingGroup && user?.role === 'teacher') {
    api.get('/teachers/students', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    .then(res => setTeacherStudents(res.data))
    .catch(err => console.error(err));
  }
}, [isCreatingGroup, user]);


const handleCreateGroup = () => {
  if (!newGroupName.trim() || selectedStudentIds.length === 0) {
    alert('Заполните название группы и выберите студентов');
    return;
  }

  api.post('/messages/group', {
    name: newGroupName,
    studentIds: selectedStudentIds,
  }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  .then(() => {
    setIsCreatingGroup(false);
    setNewGroupName('');
    setSelectedStudentIds([]);
    fetchChats(); 
    alert('Группа успешно создана!');
  })
  .catch(err => {
    alert(`Ошибка: ${err.response?.data?.message || err.message}`);
  });
};

const deleteGroup = (groupId: number) => {
  if (!window.confirm("Вы уверены, что хотите удалить группу?")) return;

  api
    .delete(`/messages/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    .then(() => {
      setChatList(chatList.filter((chat) => chat.correspondent.id !== groupId));
      alert("Группа успешно удалена!");
    })
    .catch((err) => {
      console.error("Ошибка при удалении группы", err);
      alert(`Ошибка: ${err.response?.data?.message || err.message}`);
    });
};

const chatContainerRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }
}, [messages])


  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh',  padding: '20px' }}>
      {/* Хедер */}
      <Header />

            {/* Модальное окно создания группы */}
            {isCreatingGroup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '500px',
          }}>
            <h3>Создать новую группу</h3>
            <input
              type="text"
              placeholder="Название группы"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
            />
            <div style={{ marginBottom: '1rem' }}>
              <h4>Выберите студентов:</h4>
              {teacherStudents.map(student => (
                <div key={student.id} style={{ margin: '0.5rem 0' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds([...selectedStudentIds, student.id]);
                        } else {
                          setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                        }
                      }}
                    />
                    <span style={{ marginLeft: '0.5rem' }}>
                      {student.lastName} {student.firstName}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={handleCreateGroup}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Создать
              </button>
              <button 
                onClick={() => setIsCreatingGroup(false)}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Основное содержимое (чаты и диалог) */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Вертикальный список контактов */}
        <div
          style={{
            width: '25%',
            borderRight: '1px solid #ccc',
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          <h3>Чаты</h3>
          {user?.role === 'teacher' && (
              <button
                onClick={() => setIsCreatingGroup(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Новая группа
              </button>
            )}

          {chatList.length === 0 && <p>Нет чатов</p>}
          {chatList.map((chat) => (
            <div
              key={chat.correspondent.id}
              onClick={() => loadConversation(chat)}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                background:
                  activeChat &&
                  activeChat.correspondent.id === chat.correspondent.id
                    ? '#eee'
                    : 'transparent',
              }}
            >
              {chat.isGroup ? chat.correspondent.name : `${chat.correspondent.lastName} ${chat.correspondent.firstName}`}

              {chat.isGroup && user?.role === 'teacher' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGroup(chat.correspondent.id);
                  }}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    lineHeight: '24px',
                    textAlign: 'center',
                  }}
                  >
                    ✕
                  </button>
              )}

            </div>
          ))}
        </div>
  
        {/* Область диалога */}
        <div
          style={{
            flex: 1,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
          }}
        >
          {activeChat ? (
            <>
              <h3>
              Чат с {activeChat.isGroup ? activeChat.correspondent.name : `${activeChat.correspondent.lastName} ${activeChat.correspondent.firstName}`}
              </h3>
              <div
                className='chat-conteiner'
                ref={chatContainerRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {messages.map((msg) => {
                  // Определяем, кто отправитель для выравнивания сообщения
                  const isSent =
                    user &&
                    ((user.role === 'student' &&
                      msg.senderStudent?.id === user.sub) ||
                      (user.role === 'teacher' &&
                        msg.senderTeacher?.id === user.sub));
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isSent ? 'flex-end' : 'flex-start',
                        margin: '0.5rem 0',
                      }}
                    >
                      <span
                        style={{
                          background: isSent ? '#DCF8C6' : '#EAEAEA',
                          padding: '8px 12px',
                          borderRadius: isSent
                            ? '15px 15px 0 15px'
                            : '15px 15px 15px 0',
                          maxWidth: '70%',
                          wordBreak: 'break-word',
                          marginLeft: isSent ? 'auto' : '0',
                          marginRight: isSent ? '0' : 'auto',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        {msg.content}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem' }}
                  placeholder="Введите сообщение..."
                />
                <button 
                  onClick={activeChat?.isGroup ? sendGroupMessage : sendMessage} 
                  style={{ padding: '0.5rem 1rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                >
                  {activeChat?.isGroup ? 'Отправить в группу' : 'Отправить'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              Выберите чат для начала общения
            </div>
          )}
        </div>
      </div>
    </div>
  );  
};

export default ChatPage;

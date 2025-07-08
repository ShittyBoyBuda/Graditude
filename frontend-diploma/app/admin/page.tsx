'use client';

import { useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState('');

  const handleRegister = async (e: any) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:3000/admin/register', 
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage('Регистрация прошла успешно. Теперь можно выполнить логин.');
    } catch (error) {
      setMessage('Ошибка регистрации: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/admin/login', { email, password });
      setToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
      setMessage('Логин успешный.');
    } catch (error) {
      setMessage('Ошибка логина: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleExport = async () => {
    if (!token) {
      setMessage('Для экспорта данных необходимо выполнить логин.');
      return;
    }
    try {
      const response = await axios.get('http://localhost:3000/admin/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all-data.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Экспорт успешно выполнен.');
    } catch (error: any) {
      setMessage('Ошибка экспорта: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Админ Панель</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Переключиться на Логин' : 'Переключиться на Регистрацию'}
        </button>
      </div>
      
      <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Электронная почта:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          {isRegister ? 'Регистрация' : 'Логин'}
        </button>
      </form>

      {token && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Экспорт данных</h2>
          <button onClick={handleExport} style={{ padding: '10px 20px' }}>
            Выгрузить все в Excel
          </button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminPanel;

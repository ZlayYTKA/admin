import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useNotifications } from '../components/Notifications/Notifications';

const BACKEND_URL = 'https://nothingcube.ru';
const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 1000;

export const useContainers = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotifications();
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const fetchContainers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Отсутствует токен авторизации');
      }

      const response = await fetch(`${BACKEND_URL}/admin/containers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        throw new Error('Сессия истекла. Пожалуйста, войдите заново');
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Ошибка при загрузке контейнеров');
      }

      const data = await response.json();
      setContainers(data);
      setLoading(false);
    } catch (err) {
      showNotification(err.message, 'error');
      setLoading(false);
      throw err;
    }
  }, [showNotification]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const initializeSocket = () => {
      if (!socketRef.current) {
        socketRef.current = io(BACKEND_URL, {
          auth: {
            token: `Bearer ${token}`
          },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
          reconnectionDelay: RECONNECTION_DELAY
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reconnectAttemptsRef.current++;

          if (reconnectAttemptsRef.current >= MAX_RECONNECTION_ATTEMPTS) {
            showNotification('Ошибка подключения к серверу', 'error');
          }
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected');
          reconnectAttemptsRef.current = 0;
        });

        socketRef.current.on('container_update', async (update) => {
          try {
            await fetchContainers();
          } catch (err) {
            console.error('Error updating containers:', err);
          }
        });
      }
    };

    initializeSocket();
    fetchContainers().catch(console.error);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [fetchContainers, showNotification]);

  const makeRequest = async (method, url, body = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Отсутствует токен авторизации');
      }

      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BACKEND_URL}${url}`, options);

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        throw new Error('Сессия истекла. Пожалуйста, войдите заново');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка выполнения запроса');
      }

      return data;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const createContainer = async (containerData) => {
    try {
      const result = await makeRequest('POST', '/admin/containers', containerData);
      await fetchContainers();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateContainer = async (id, containerData) => {
    try {
      const result = await makeRequest('PUT', `/admin/containers/${id}`, containerData);
      await fetchContainers();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const toggleContainerActive = async (id) => {
    try {
      const result = await makeRequest('PATCH', `/admin/containers/${id}/toggle-active`);
      await fetchContainers();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteContainer = async (id) => {
    try {
      const result = await makeRequest('DELETE', `/admin/containers/${id}`);
      await fetchContainers();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    containers,
    loading,
    createContainer,
    updateContainer,
    toggleContainerActive,
    deleteContainer
  };
};
import { useState, useEffect } from 'react';
import { useNotifications } from '../components/Notifications/Notifications';

const BACKEND_URL = 'https://nothingcube.ru';

export const useShop = () => {
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotifications();

  const fetchShopItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Отсутствует токен авторизации');
      }

      const response = await fetch(`${BACKEND_URL}/admin/shop`, {
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
        throw new Error(data.message || 'Ошибка при загрузке предметов магазина');
      }

      const data = await response.json();
      setShopItems(data);
      setLoading(false);
    } catch (err) {
      showNotification(err.message, 'error');
      setLoading(false);
      throw err;
    }
  };

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

  const createShopItem = async (itemData) => {
    try {
      const result = await makeRequest('POST', '/admin/shop', itemData);
      await fetchShopItems();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateShopItem = async (id, itemData) => {
    try {
      const result = await makeRequest('PUT', `/admin/shop/${id}`, itemData);
      await fetchShopItems();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const toggleShopItemActive = async (id) => {
    try {
      const result = await makeRequest('PATCH', `/admin/shop/${id}/toggle-active`);
      await fetchShopItems();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteShopItem = async (id) => {
    try {
      const result = await makeRequest('DELETE', `/admin/shop/${id}`);
      await fetchShopItems();
      return result;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchShopItems().catch(console.error);
  }, []);

  return {
    shopItems,
    loading,
    createShopItem,
    updateShopItem,
    toggleShopItemActive,
    deleteShopItem
  };
};
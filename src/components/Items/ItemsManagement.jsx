import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNotifications } from '../Notifications/Notifications';
import ItemForm from './ItemForm';
import Spinner from '../Common/Spinner';
import './ItemsManagement.css';

const BACKEND_URL = 'https://nothingcube.ru';

const ItemsManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { showNotification } = useNotifications();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/items`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Ошибка при загрузке предметов');
      }

      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (err) {
      showNotification(err.message, 'error');
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот предмет?')) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/admin/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Ошибка при удалении предмета');
      }

      showNotification('Предмет успешно удален', 'success');
      fetchItems();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="items-management">
      <div className="management-header">
        <h2>Управление предметами</h2>
        <button
          className="add-button"
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
        >
          <Plus className="icon" />
          Добавить предмет
        </button>
      </div>

      <div className="items-grid">
        {items.map(item => (
          <div key={item.id} className="item-card">
            <div className="item-image-container">
              <img
                src={`data:image/png;base64,${item.image_data}`}
                alt={item.name}
                className="item-image"
              />
            </div>
            <div className="item-info">
              <h3>{item.name}</h3>
              <p className="item-id">ID: {item.id}</p>
            </div>
            <div className="item-actions">
              <button
                className="edit-button"
                onClick={() => {
                  setEditingItem(item);
                  setShowForm(true);
                }}
              >
                Изменить
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(item.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ItemForm
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSubmit={async (formData) => {
            try {
              const response = await fetch(
                `${BACKEND_URL}/admin/items${editingItem ? `/${editingItem.id}` : ''}`,
                {
                  method: editingItem ? 'PUT' : 'POST',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: formData
                }
              );

              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Ошибка при сохранении предмета');
              }

              showNotification(
                `Предмет успешно ${editingItem ? 'обновлен' : 'создан'}`,
                'success'
              );
              setShowForm(false);
              setEditingItem(null);
              fetchItems();
            } catch (err) {
              showNotification(err.message, 'error');
            }
          }}
          initialData={editingItem}
        />
      )}
    </div>
  );
};

export default ItemsManagement;
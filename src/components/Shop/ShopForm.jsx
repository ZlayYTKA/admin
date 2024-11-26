import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNotifications } from '../Notifications/Notifications';
import './ShopForm.css';

const BACKEND_URL = 'https://nothingcube.ru';
const CATEGORIES = ['Genshin Impact', 'Honkai: Star Rail', 'Zenless Zone Zero'];

const ShopForm = ({ onClose, onSubmit, initialData = null }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialData || {
    item_id: '',
    category: CATEGORIES[0],
    cost: 0,
    active: false
  });
  const { showNotification } = useNotifications();

  useEffect(() => {
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
        setItems(data.filter(item => item.active));
      } catch (err) {
        showNotification(err.message, 'error');
      }
    };

    fetchItems();
  }, [showNotification]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const validateForm = () => {
    if (!formData.item_id) {
      showNotification('Выберите предмет', 'error');
      return false;
    }

    if (!formData.category) {
      showNotification('Выберите категорию', 'error');
      return false;
    }

    if (formData.cost <= 0) {
      showNotification('Стоимость должна быть больше 0', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`modal-content ${isClosing ? 'closing' : ''}`}>
        <div className="modal-header">
          <h2>{initialData ? 'Редактировать товар' : 'Добавить новый товар'}</h2>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="shop-form">
          <div className="form-group">
            <label>Предмет</label>
            <div className="shop-items-grid">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`shop-item-select-card ${formData.item_id === item.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, item_id: item.id }))}
                >
                  <div className="shop-item-select-image-container">
                    <img
                      src={`data:image/png;base64,${item.image_data}`}
                      alt={item.name}
                      className="shop-item-select-image"
                    />
                  </div>
                  <div className="shop-item-select-name">{item.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Категория</label>
            <select
              id="category"
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="form-select"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cost">Стоимость (USDT)</label>
            <input
              id="cost"
              type="number"
              step="any"
              value={formData.cost}
              onChange={e => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
              className="form-input"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              />
              <span>Активен</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleClose}>
              Отмена
            </button>
            <button type="submit" className="submit-button">
              {initialData ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopForm;
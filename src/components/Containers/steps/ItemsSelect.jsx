import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../Notifications/Notifications';
import './ItemsSelect.css';

const BACKEND_URL = 'https://nothingcube.ru';

const ItemsSelect = ({ formData, updateFormData }) => {
  const [items, setItems] = useState([]);
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

  const handleItemClick = (itemId) => {
    const newItems = formData.items.includes(itemId)
      ? formData.items.filter(id => id !== itemId)
      : [...formData.items, itemId];

    const newChances = { ...formData.items_chances };
    if (!newItems.includes(itemId)) {
      delete newChances[itemId];
    }

    updateFormData({
      items: newItems,
      items_chances: newChances
    });
  };

  return (
    <div className="items-select">
      <div className="items-select-grid">
        {items.map(item => (
          <div
            key={item.id}
            className={`item-select-card ${formData.items.includes(item.id) ? 'selected' : ''}`}
            onClick={() => handleItemClick(item.id)}
          >
            <div className="item-select-image-container">
              <img
                src={`data:image/png;base64,${item.image_data}`}
                alt={item.name}
                className="item-select-image"
              />
            </div>
            <div className="item-select-name">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsSelect;
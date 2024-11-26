import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../Notifications/Notifications';

const BACKEND_URL = 'https://nothingcube.ru';

const ChancesConfig = ({ formData, updateFormData }) => {
  const [items, setItems] = useState({});
  const [totalChance, setTotalChance] = useState(() => {
    return Object.values(formData.items_chances).reduce((sum, chance) => sum + (parseFloat(chance) || 0), 0);
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
        const itemsMap = {};
        data.forEach(item => {
          itemsMap[item.id] = item;
        });
        setItems(itemsMap);
      } catch (err) {
        showNotification(err.message, 'error');
      }
    };

    fetchItems();
  }, [showNotification]);

  const handleChanceChange = (itemId, inputValue) => {
    let value = inputValue.replace(/[^0-9.]/g, '');

    if (value.startsWith('.')) value = '0' + value;
    if (value === '') value = '0';

    const newChances = {
      ...formData.items_chances,
      [itemId]: value
    };

    updateFormData({ items_chances: newChances });

    const total = Object.values(newChances)
      .reduce((sum, val) => sum + parseFloat(val || 0), 0);

    setTotalChance(total);
  };

  const getChanceBarWidth = (chance) => {
    const parsed = parseFloat(chance) || 0;
    return Math.min(parsed, 100) + '%';
  };

  return (
    <div className="chances-config">
      <div className="chances-header">
        <h3>Настройка шансов выпадения</h3>
        <div className={`total-chance-badge ${Math.abs(totalChance - 100) < 0.00001 ? 'valid' : 'invalid'}`}>
          {totalChance === 100 ? (
            <span>✓ Сумма шансов: 100%</span>
          ) : (
            <span>Сумма шансов: {totalChance.toFixed(5)}% {totalChance < 100 ? '(Недостаточно)' : '(Превышено)'}</span>
          )}
        </div>
      </div>

      <div className="chances-items">
        {formData.items.map(itemId => {
          const item = items[itemId];
          if (!item) return null;

          return (
            <div key={itemId} className="chance-item">
              <div className="chance-item-header">
                <div className="chance-item-info">
                  <img
                    src={`data:image/png;base64,${item.image_data}`}
                    alt={item.name}
                    className="chance-item-image"
                  />
                  <span className="chance-item-name">{item.name}</span>
                </div>
                <div className="chance-input-wrapper">
                  <input
                    type="text"
                    value={formData.items_chances[itemId] || ''}
                    onChange={e => handleChanceChange(itemId, e.target.value)}
                    className="chance-input"
                  />
                  <span className="chance-percent">%</span>
                </div>
              </div>
              <div className="chance-bar-wrapper">
                <div
                  className="chance-bar"
                  style={{ width: getChanceBarWidth(formData.items_chances[itemId]) }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChancesConfig;
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNotifications } from '../Notifications/Notifications';
import ShopForm from './ShopForm';
import Spinner from '../Common/Spinner';
import { useShop } from '../../hooks/useShop';
import './ShopManagement.css';

const ShopManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const {
    shopItems,
    loading,
    createShopItem,
    updateShopItem,
    toggleShopItemActive,
    deleteShopItem
  } = useShop();
  const { showNotification } = useNotifications();

  const handleCreate = async (data) => {
    try {
      const result = await createShopItem(data);
      if (result) {
        setShowForm(false);
        showNotification('Товар успешно добавлен', 'success');
      }
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  const handleUpdate = async (data) => {
    try {
      const result = await updateShopItem(editingItem.id, data);
      if (result) {
        setShowForm(false);
        setEditingItem(null);
        showNotification('Товар успешно обновлен', 'success');
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const result = await toggleShopItemActive(item.id);
      if (result) {
        showNotification(
          `Товар ${item.active ? 'деактивирован' : 'активирован'}`,
          'success'
        );
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        const result = await deleteShopItem(id);
        if (result) {
          showNotification('Товар успешно удален', 'success');
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="shop-management">
      <div className="management-header">
        <h2>Управление магазином</h2>
        <button
          className="add-button"
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
        >
          <Plus className="icon" />
          Добавить товар
        </button>
      </div>

      <div className="container-card">
        <div className="card-header">
          <h3>Список товаров</h3>
        </div>
        <div className="table-container">
          <table className="shop-table">
            <thead>
              <tr>
                <th>Предмет</th>
                <th>Категория</th>
                <th>Стоимость</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {shopItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="item-info">
                      <img
                        src={`data:image/png;base64,${item.item?.image_data}`}
                        alt={item.item?.name}
                        className="item-thumbnail"
                      />
                      <span>{item.item?.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge ${item.category.toLowerCase().replace(/:\s/g, '-')}`}>
                      {item.category}
                    </span>
                  </td>
                  <td>{item.cost} USDT</td>
                  <td>
                    <span
                      className={`badge ${item.active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(item)}
                      title={item.active ? 'Нажмите, чтобы деактивировать' : 'Нажмите, чтобы активировать'}
                    >
                      {item.active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ShopForm
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          initialData={editingItem}
        />
      )}
    </div>
  );
};

export default ShopManagement;
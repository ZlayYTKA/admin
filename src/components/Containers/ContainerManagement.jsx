import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import './ContainerManagement.css';
import ContainerForm from './ContainerForm';
import { useContainers } from '../../hooks/useContainers';
import { useNotifications } from '../Notifications/Notifications';
import Spinner from '../Common/Spinner';

const BACKEND_URL = 'https://nothingcube.ru';

const ContainerManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [items, setItems] = useState({});
  const { showNotification } = useNotifications();

  const {
    containers,
    loading,
    error,
    createContainer,
    updateContainer,
    toggleContainerActive,
    deleteContainer
  } = useContainers();

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

  const handleCreate = async (data) => {
    try {
      const result = await createContainer(data);
      if (result) {
        setShowForm(false);
        showNotification('Контейнер успешно создан', 'success');
      }
    } catch (err) {
      showNotification(err.message, 'error');
      console.error('Create error:', err);
    }
  };

  const handleUpdate = async (data) => {
    try {
      const result = await updateContainer(editingContainer.id, data);
      if (result) {
        setShowForm(false);
        setEditingContainer(null);
        showNotification('Контейнер успешно обновлен', 'success');
      }
    } catch (err) {
      showNotification(err.message, 'error');
      console.error('Update error:', err);
    }
  };

  const handleToggleActive = async (container) => {
    try {
      const result = await toggleContainerActive(container.id);
      if (result) {
        showNotification(
          `Контейнер ${container.active ? 'деактивирован' : 'активирован'}`,
          'success'
        );
      }
    } catch (err) {
      showNotification(err.message, 'error');
      console.error('Toggle error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот контейнер?')) {
      try {
        const result = await deleteContainer(id);
        if (result) {
          showNotification('Контейнер успешно удален', 'success');
        }
      } catch (err) {
        showNotification(err.message, 'error');
        console.error('Delete error:', err);
      }
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="container-management">
      <div className="management-header">
        <h2>Управление контейнерами</h2>
        <button
          className="add-button"
          onClick={() => {
            setEditingContainer(null);
            setShowForm(true);
          }}
        >
          <Plus className="icon" />
          Добавить контейнер
        </button>
      </div>

      <div className="container-card">
        <div className="card-header">
          <h3>Список контейнеров</h3>
        </div>
        <div className="table-container">
          <table className="containers-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Стоимость</th>
                <th>Статус</th>
                <th>Открытий</th>
                <th>Задания</th>
                <th>Предметы</th>
                <th>Кулдаун</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container) => (
                <tr key={container.id}>
                  <td>{container.name}</td>
                  <td>
                    <span className={`badge ${container.type}`}>
                      {container.type.toUpperCase()}
                    </span>
                  </td>
                  <td>{container.cost}</td>
                  <td>
                    <span
                      className={`badge ${container.active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(container)}
                      title={container.active ? 'Нажмите, чтобы деактивировать' : 'Нажмите, чтобы активировать'}
                    >
                      {container.active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td>
                    {container.total_opens === null ? '∞' :
                     `${container.remaining_opens}/${container.total_opens}`}
                  </td>
                  <td>
                    <div className="task-badges">
                      {container.task_types?.map(task => (
                        <span key={task} className="badge task">
                          {task}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="task-badges">
                      {container.items?.map(itemId => {
                        const item = items[itemId];
                        return (
                          <span
                            key={itemId}
                            className="badge item"
                            title={`Шанс: ${container.items_chances[itemId]}%`}
                          >
                            {item ? item.name : itemId}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    {container.cooldown_minutes ?
                      `${Math.floor(container.cooldown_minutes / 1440)}д ${Math.floor((container.cooldown_minutes % 1440) / 60)}ч ${container.cooldown_minutes % 60}м` :
                      'Нет'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => {
                          setEditingContainer(container);
                          setShowForm(true);
                        }}
                      >
                        Изменить
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(container.id)}
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
        <ContainerForm
          onClose={() => {
            setShowForm(false);
            setEditingContainer(null);
          }}
          onSubmit={editingContainer ? handleUpdate : handleCreate}
          initialData={editingContainer}
        />
      )}
    </div>
  );
};

export default ContainerManagement;
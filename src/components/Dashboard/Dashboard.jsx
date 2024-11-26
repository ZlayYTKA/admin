import React, { useState, useEffect } from 'react';
import { Home, Package, ShoppingBag, Users, BarChart, Box } from 'lucide-react';
import ContainerManagement from '../Containers/ContainerManagement';
import ItemsManagement from '../Items/ItemsManagement';
import { useNotifications } from '../Notifications/Notifications';
import ShopManagement from '../Shop/ShopManagement';
import './Dashboard.css';

const Dashboard = ({ userData }) => {
  const [activeTab, setActiveTab] = useState('main');
  const { showNotification } = useNotifications();

  useEffect(() => {
    if (!userData) {
      showNotification('Ошибка получения данных пользователя', 'error');
      localStorage.removeItem('token');
      window.location.reload();
    }
  }, [userData, showNotification]);

  if (!userData) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'containers':
        return <ContainerManagement />;
      case 'items':
        return <ItemsManagement />;
      case 'shop':
        return <ShopManagement />;
      default:
        return <h1 className="welcome-text">Админ-панель</h1>;
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-content">
          <div>
            <div className="sidebar-header">
              <h1 className="noselect">Админ-Панель</h1>
            </div>

            <div className="nav-items">
              <button
                className={`nav-item ${activeTab === 'main' ? 'active' : ''}`}
                onClick={() => setActiveTab('main')}
              >
                <Home size={20} />
                <span>Главная</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <BarChart size={20} />
                <span>Статистика</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'containers' ? 'active' : ''}`}
                onClick={() => setActiveTab('containers')}
              >
                <Package size={20} />
                <span>Контейнеры</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'items' ? 'active' : ''}`}
                onClick={() => setActiveTab('items')}
              >
                <Box size={20} />
                <span>Предметы</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
                onClick={() => setActiveTab('shop')}
              >
                <ShoppingBag size={20} />
                <span>Магазин</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <Users size={20} />
                <span>Пользователи</span>
              </button>
            </div>
          </div>

          <div className="user-profile">
            <span className="user-nickname">{userData.nickname}</span>
            <span className="user-role">{userData.role}</span>
          </div>
        </div>
      </div>
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
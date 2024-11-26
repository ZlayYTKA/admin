import React, { createContext, useContext, useState, useCallback } from 'react';
import './Notifications.css';

const NotificationsContext = createContext();

const Notification = ({ message, type, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  React.useEffect(() => {
    const removeTimer = setTimeout(() => {
      setIsRemoving(true);
      setTimeout(onRemove, 200);
    }, 4500);

    return () => clearTimeout(removeTimer);
  }, [onRemove]);

  return (
    <div className={`notification ${type} ${isRemoving ? 'removing' : ''}`}>
      {message}
    </div>
  );
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    switch (type) {
      case 'error':
        console.error('Notification:', message);
        break;
      case 'warning':
        console.warn('Notification:', message);
        break;
      default:
        console.log('Notification:', message);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationsContext.Provider value={{ showNotification }}>
      <div className="notifications-container">
        {notifications.map(({ id, message, type }) => (
          <Notification
            key={id}
            message={message}
            type={type}
            onRemove={() => removeNotification(id)}
          />
        ))}
      </div>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
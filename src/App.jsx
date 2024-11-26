import React, { useState } from 'react';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import { NotificationsProvider } from './components/Notifications/Notifications';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);

  const handleAuthSuccess = (data) => {
    setUserData(data);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserData(null);
  };

  return (
    <NotificationsProvider>
      <div className="app">
        {!isAuthenticated ? (
          <Login onAuthSuccess={handleAuthSuccess} />
        ) : (
          <Dashboard userData={userData} onLogout={handleLogout} />
        )}
      </div>
    </NotificationsProvider>
  );
};

export default App;
import React, { useEffect, useState } from 'react';
import './Login.css';

const Login = ({ onAuthSuccess }) => {
  const [error, setError] = useState('');
  const maxRetries = 3;

  useEffect(() => {
    window.TelegramLoginWidget = {
      dataOnauth: async (user) => {
        let retryCount = 0;

        const tryAuth = async () => {
          try {
            const response = await fetch('https://nothingcube.ru/admin/admin-auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include',
              mode: 'cors',
              body: JSON.stringify({
                init_data: user
              })
            });

            const data = await response.json();

            if (response.ok && data.authorized) {
              localStorage.setItem('token', data.user_data.token);
              onAuthSuccess(data.user_data);
            } else {
              if (response.status === 500 && retryCount < maxRetries) {
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000));
                return tryAuth();
              } else {
                setError(data.message || 'У вас нет доступа');
              }
            }
          } catch (error) {
            if (retryCount < maxRetries) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000));
              return tryAuth();
            } else {
              setError('Произошла ошибка при авторизации');
            }
          }
        };

        await tryAuth();
      }
    };

    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute('data-telegram-login', 'testfromytka1_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
    script.setAttribute('data-request-access', 'write');

    const container = document.getElementById('telegram-login');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      const container = document.getElementById('telegram-login');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [onAuthSuccess]);

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Админ-панель</h1>
        <div id="telegram-login"></div>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNotifications } from '../Notifications/Notifications';
import './ContainerForm.css';
import BasicInfo from './steps/BasicInfo';
import TasksConfig from './steps/TasksConfig';
import ItemsSelect from './steps/ItemsSelect';
import ChancesConfig from './steps/ChancesConfig';

const STEPS = [
  {
    id: 1,
    title: 'Основная информация',
    component: BasicInfo
  },
  {
    id: 2,
    title: 'Настройка заданий',
    component: TasksConfig
  },
  {
    id: 3,
    title: 'Выбор предметов',
    component: ItemsSelect
  },
  {
    id: 4,
    title: 'Настройка шансов',
    component: ChancesConfig
  }
];

const validateChances = (items_chances) => {
  const total = Object.values(items_chances)
    .reduce((sum, chance) => {
      const value = parseFloat(parseFloat(chance || 0).toFixed(5));
      return sum + value;
    }, 0);

  return Math.abs(total - 100) < 0.00001;
};

const ContainerForm = ({ onClose, onSubmit, initialData = null }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { showNotification } = useNotifications();
  const [formData, setFormData] = useState(initialData || {
    name: '',
    type: 'free',
    cost: 0,
    active: false,
    total_opens: null,
    cooldown_minutes: 0,
    task_types: [],
    task_data: {},
    items: [],
    items_chances: {},
    cooldown: {
      days: 0,
      hours: 0,
      minutes: 0
    }
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          showNotification('Введите название контейнера', 'error');
          return false;
        }
        if (formData.type !== 'free' && (!formData.cost || formData.cost <= 0)) {
          showNotification('Укажите стоимость контейнера', 'error');
          return false;
        }
        return true;

      case 2:
        if (formData.task_types.length > 0) {
          for (const type of formData.task_types) {
            if (!formData.task_data[type]) {
              showNotification(`Заполните данные для задания ${type}`, 'error');
              return false;
            }
          }
        }
        return true;

      case 3:
        if (!formData.items.length) {
          showNotification('Выберите хотя бы один предмет', 'error');
          return false;
        }
        return true;

      case 4:
        // Проверяем, что для каждого предмета указан шанс
        if (Object.keys(formData.items_chances).length !== formData.items.length) {
          showNotification('Укажите шансы для всех предметов', 'error');
          return false;
        }

        // Проверяем сумму шансов
        if (!validateChances(formData.items_chances)) {
          showNotification('Сумма шансов должна быть равна 100%', 'error');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      if (!validateStep(currentStep)) {
        return;
      }

      const { cooldown, ...submitData } = {
        ...formData,
        total_opens: formData.total_opens === null ? null : parseInt(formData.total_opens),
        cooldown_minutes: parseInt(formData.cooldown_minutes || 0),
        cost: parseFloat(formData.cost || 0)
      };

      await onSubmit(submitData);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`modal-content ${isClosing ? 'closing' : ''}`}>
        <div className="modal-header">
          <h2>{initialData ? 'Редактировать контейнер' : 'Создать новый контейнер'}</h2>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="form-steps">
          {STEPS.map(step => (
            <div
              key={step.id}
              className={`step ${currentStep === step.id ? 'active' : ''} 
                         ${currentStep > step.id ? 'completed' : ''}`}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>

        <div className="form-content">
          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
          />
        </div>

        <div className="form-actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              Назад
            </button>
          )}
          {currentStep < STEPS.length ? (
            <button
              type="button"
              className="next-button"
              onClick={handleNext}
            >
              Далее
            </button>
          ) : (
            <button
              type="button"
              className="submit-button"
              onClick={handleSubmit}
            >
              {initialData ? 'Сохранить' : 'Создать'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContainerForm;
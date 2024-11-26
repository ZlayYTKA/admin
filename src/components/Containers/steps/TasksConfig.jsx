import React from 'react';
import { TASK_TYPES } from '../../../config/containerTypes';

const TasksConfig = ({ formData, updateFormData }) => {
  const handleTaskClick = (type) => {
    const newTaskTypes = formData.task_types.includes(type)
      ? formData.task_types.filter(t => t !== type)
      : [...formData.task_types, type];

    const newTaskData = { ...formData.task_data };
    if (!newTaskTypes.includes(type)) {
      delete newTaskData[type];
    }

    updateFormData({
      task_types: newTaskTypes,
      task_data: newTaskData
    });
  };

  return (
    <div className="tasks-config">
      {Object.entries(TASK_TYPES).map(([type, config]) => (
        <div
          key={type}
          className={`task-item ${formData.task_types.includes(type) ? 'selected' : ''}`}
          onClick={() => handleTaskClick(type)}
        >
          <div className="task-header">
            <div className="task-label">{config.label}</div>
            <div className="task-description">{config.description}</div>
          </div>

          {formData.task_types.includes(type) && (
            <div className="task-data-input">
              {config.dataType === 'channels' && (
                <>
                  <label>Список каналов</label>
                  <textarea
                    value={formData.task_data[type]?.join('\n') || ''}
                    onChange={e => updateFormData({
                      task_data: {
                        ...formData.task_data,
                        [type]: e.target.value.split('\n').filter(Boolean)
                      }
                    })}
                    placeholder="Пример:
@channel_name
https://t.me/channel_name"
                    className="form-textarea"
                    onClick={e => e.stopPropagation()}
                  />
                </>
              )}

              {config.dataType === 'number' && (
                <>
                  <label>
                    {type === 'referral' ? 'Количество рефералов' : 'Минимальный уровень'}
                  </label>
                  <input
                    type="number"
                    value={formData.task_data[type] || ''}
                    onChange={e => updateFormData({
                      task_data: {
                        ...formData.task_data,
                        [type]: parseInt(e.target.value) || 0
                      }
                    })}
                    min="0"
                    className="form-input"
                    onClick={e => e.stopPropagation()}
                  />
                </>
              )}

              {config.dataType === 'amount' && (
                <>
                  <label>Сумма депозита</label>
                  <div className="amount-input">
                    <input
                      type="number"
                      value={formData.task_data[type]?.amount || ''}
                      onChange={e => updateFormData({
                        task_data: {
                          ...formData.task_data,
                          [type]: {
                            amount: parseFloat(e.target.value) || 0,
                            currency: 'usdt'
                          }
                        }
                      })}
                      step="any"
                      min="0"
                      className="form-input"
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="currency-label">USDT</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TasksConfig;
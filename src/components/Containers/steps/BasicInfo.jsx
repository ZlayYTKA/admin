import React from 'react';
import { CONTAINER_TYPES } from '../../../config/containerTypes';

const BasicInfo = ({ formData, updateFormData }) => {
  const handleCooldownChange = (type, value) => {
    const cooldown = { ...formData.cooldown };
    cooldown[type] = parseInt(value) || 0;

    const totalMinutes =
      (cooldown.days * 24 * 60) +
      (cooldown.hours * 60) +
      cooldown.minutes;

    updateFormData({
      cooldown,
      cooldown_minutes: totalMinutes
    });
  };

  const handleTotalOpensChange = (value) => {
    const total_opens = value === '' ? null : parseInt(value);
    updateFormData({ total_opens });
  };

  return (
    <div className="step-content">
      <div className="form-group">
        <label htmlFor="name">Название контейнера</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={e => updateFormData({ name: e.target.value })}
          placeholder="Введите название контейнера"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="type">Тип контейнера</label>
        <select
          id="type"
          value={formData.type}
          onChange={e => {
            const newType = e.target.value;
            updateFormData({
              type: newType,
              cost: newType === 'free' ? 0 : formData.cost
            });
          }}
          className="form-select"
        >
          {CONTAINER_TYPES.map(type => (
            <option key={type} value={type}>
              {type.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {formData.type !== 'free' && (
        <div className="form-group">
          <label htmlFor="cost">Стоимость</label>
          <input
            id="cost"
            type="number"
            step="any"
            value={formData.cost}
            onChange={e => updateFormData({ cost: parseFloat(e.target.value) || 0 })}
            placeholder="Введите стоимость"
            className="form-input"
          />
        </div>
      )}

      <div className="form-group">
        <label>Кулдаун</label>
        <div className="cooldown-inputs">
          <div className="cooldown-input">
            <input
              type="number"
              min="0"
              value={formData.cooldown?.days || 0}
              onChange={e => handleCooldownChange('days', e.target.value)}
              className="form-input"
            />
            <span>дней</span>
          </div>
          <div className="cooldown-input">
            <input
              type="number"
              min="0"
              max="23"
              value={formData.cooldown?.hours || 0}
              onChange={e => handleCooldownChange('hours', e.target.value)}
              className="form-input"
            />
            <span>часов</span>
          </div>
          <div className="cooldown-input">
            <input
              type="number"
              min="0"
              max="59"
              value={formData.cooldown?.minutes || 0}
              onChange={e => handleCooldownChange('minutes', e.target.value)}
              className="form-input"
            />
            <span>минут</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="total_opens">Количество открытий</label>
        <div className="total-opens-input">
          <input
            id="total_opens"
            type="number"
            min="1"
            value={formData.total_opens === null ? '' : formData.total_opens}
            onChange={e => handleTotalOpensChange(e.target.value)}
            placeholder="Оставьте пустым для бесконечности"
            className="form-input"
          />
          <span className="input-hint">
            {formData.total_opens === null ? 'Бесконечно' : `Ограничено: ${formData.total_opens}`}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={e => updateFormData({ active: e.target.checked })}
          />
          <span>Активен</span>
        </label>
      </div>
    </div>
  );
};

export default BasicInfo;
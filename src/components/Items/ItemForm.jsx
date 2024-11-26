import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './ItemForm.css';

const ItemForm = ({ onClose, onSubmit, initialData = null }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        image: null
      });
      setImagePreview(`data:image/png;base64,${initialData.image_data}`);
    }
  }, [initialData]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = 'ID предмета обязателен';
    } else if (!/^[a-z0-9_]+$/.test(formData.id)) {
      newErrors.id = 'ID может содержать только строчные буквы, цифры и подчеркивания';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Название предмета обязательно';
    }

    if (!initialData && !formData.image) {
      newErrors.image = 'Изображение обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id);
    formDataToSend.append('name', formData.name);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    onSubmit(formDataToSend);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors({...errors, image: 'Размер файла не должен превышать 2MB'});
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors({...errors, image: 'Выбранный файл не является изображением'});
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`modal-content ${isClosing ? 'closing' : ''}`}>
        <div className="modal-header">
          <h2>{initialData ? 'Редактировать предмет' : 'Создать новый предмет'}</h2>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-group">
            <label htmlFor="id">ID предмета</label>
            <input
              id="id"
              type="text"
              value={formData.id}
              onChange={e => {
                setFormData(prev => ({ ...prev, id: e.target.value }));
                if (errors.id) {
                  setErrors(prev => ({ ...prev, id: null }));
                }
              }}
              placeholder="Например: primogems_60"
              className={`form-input ${errors.id ? 'error' : ''}`}
              disabled={!!initialData}
            />
            {errors.id && <span className="error-message">{errors.id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="name">Название предмета</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: null }));
                }
              }}
              placeholder="Например: 60 Примогемов"
              className={`form-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="image">Изображение предмета</label>
            <div className="image-upload">
              <div className="image-preview">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span>Нажмите или перетащите файл</span>
                    <span className="upload-hint">PNG или JPG, максимум 2MB</span>
                  </div>
                )}
              </div>
              <input
                id="image"
                type="file"
                onChange={handleFileChange}
                accept="image/png,image/jpeg"
                className="file-input"
              />
            </div>
            {errors.image && <span className="error-message">{errors.image}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleClose}>
              Отмена
            </button>
            <button type="submit" className="submit-button">
              {initialData ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
import React, { useState, useRef } from 'react';
import { uploadFile, BUCKETS } from '../services/storageApi';
import { updateUserProfile } from '../services/usersApi';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../contexts/ModalContext';
import './AvatarUpload.css';

const AvatarUpload = ({ onAvatarUpdate }) => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showModal({
        title: 'Erro',
        message: 'Por favor, selecione uma imagem válida (JPG, PNG, WEBP ou GIF).',
        type: 'warning',
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showModal({
        title: 'Erro',
        message: 'A imagem deve ter no máximo 5MB.',
        type: 'warning',
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Renomear arquivo para usar o UID do usuário
      const fileExtension = file.name.split('.').pop();
      const newFileName = `${user.uid}.${fileExtension}`;
      const renamedFile = new File([file], newFileName, { type: file.type });

      // Upload para R2
      const uploadResult = await uploadFile(
        BUCKETS.AVATARS,
        renamedFile,
        (progress) => setUploadProgress(progress)
      );

      // Atualizar perfil do usuário com a nova URL
      await updateUserProfile({
        email: user.email,
        photoURL: uploadResult.url,
        displayName: user.displayName,
      });

      showModal({
        title: 'Sucesso',
        message: 'Foto de perfil atualizada com sucesso!',
        type: 'success',
      });

      // Notificar componente pai
      if (onAvatarUpdate) {
        onAvatarUpdate(uploadResult.url);
      }

      // Recarregar a página para atualizar o Firebase Auth
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      showModal({
        title: 'Erro',
        message: error.message || 'Erro ao fazer upload da foto de perfil.',
        type: 'danger',
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const currentAvatarUrl = previewUrl || user?.photoURL;

  return (
    <div className="avatar-upload">
      <div className="avatar-container" onClick={!uploading ? handleClick : undefined}>
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="Avatar" className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path
                d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {uploading && (
          <div className="avatar-overlay">
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <span className="upload-text">{Math.round(uploadProgress)}%</span>
          </div>
        )}

        {!uploading && (
          <div className="avatar-edit-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M3 16V8C3 6.89543 3.89543 6 5 6H6.5L8 4H16L17.5 6H19C20.1046 6 21 6.89543 21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <p className="avatar-hint">
        {uploading ? 'Enviando...' : 'Clique para alterar a foto'}
      </p>
    </div>
  );
};

export default AvatarUpload;

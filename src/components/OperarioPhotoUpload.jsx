import React, { useState, useRef } from 'react';
import { uploadFile, BUCKETS } from '../services/storageApi';
import { FiCamera, FiX } from 'react-icons/fi';

const OperarioPhotoUpload = ({ currentPhotoUrl, onPhotoChange, operarioId }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentPhotoUrl || null);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Por favor, selecione uma imagem válida (JPG, PNG ou WEBP).');
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    await handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Renomear arquivo usando ID temporário ou timestamp
      const fileExtension = file.name.split('.').pop();
      const timestamp = Date.now();
      const newFileName = operarioId
        ? `${operarioId}.${fileExtension}`
        : `temp_${timestamp}.${fileExtension}`;
      const renamedFile = new File([file], newFileName, { type: file.type });

      // Upload para R2
      const uploadResult = await uploadFile(
        BUCKETS.OPERARIOS,
        renamedFile,
        (progress) => setUploadProgress(progress)
      );

      // Notificar componente pai com a nova URL
      if (onPhotoChange) {
        onPhotoChange(uploadResult.url);
      }

      setPreviewUrl(uploadResult.url);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      setError(error.message || 'Erro ao fazer upload da foto.');
      setPreviewUrl(currentPhotoUrl);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    if (onPhotoChange) {
      onPhotoChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#1e293b' }}>
        Foto do Operário
      </label>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div
          onClick={handleClick}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '8px',
            border: '2px dashed #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f8fafc',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!uploading) {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Foto do operário"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {!uploading && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = 1;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = 0;
                  }}
                >
                  <FiCamera size={24} color="white" />
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <FiCamera size={32} style={{ marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.75rem' }}>Clique para adicionar</p>
            </div>
          )}

          {uploading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <div
                style={{
                  width: '80%',
                  height: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem' }}>{Math.round(uploadProgress)}%</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            {uploading ? 'Enviando foto...' : 'Clique na imagem para adicionar ou alterar a foto'}
          </p>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            Formatos aceitos: JPG, PNG, WEBP (máx. 5MB)
          </p>
          {previewUrl && !uploading && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fecaca';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
              }}
            >
              <FiX size={16} />
              Remover foto
            </button>
          )}
          {error && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#dc2626' }}>
              {error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default OperarioPhotoUpload;

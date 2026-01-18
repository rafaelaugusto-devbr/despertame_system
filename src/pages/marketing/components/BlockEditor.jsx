// Block Editor - WordPress Gutenberg-like
import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiType,
  FiImage,
  FiVideo,
  FiList,
  FiAlignLeft,
  FiCode,
  FiChevronUp,
  FiChevronDown,
  FiTrash2,
  FiEye,
  FiEdit3
} from 'react-icons/fi';
import './BlockEditor.css';

const BLOCK_TYPES = {
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  IMAGE: 'image',
  VIDEO: 'video',
  QUOTE: 'quote',
  LIST: 'list',
  CODE: 'code'
};

const BlockEditor = ({ initialBlocks = [], onChange }) => {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (onChange) {
      onChange(blocks);
    }
  }, [blocks, onChange]);

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      settings: getDefaultSettings(type)
    };
    setBlocks([...blocks, newBlock]);
    setShowBlockMenu(false);
  };

  const getDefaultSettings = (type) => {
    switch (type) {
      case BLOCK_TYPES.HEADING:
        return { level: 'h2', size: 'normal' };
      case BLOCK_TYPES.LIST:
        return { ordered: false };
      case BLOCK_TYPES.IMAGE:
        return { url: '', alt: '', caption: '', size: 'medium' };
      case BLOCK_TYPES.VIDEO:
        return { url: '', size: 'medium' };
      case BLOCK_TYPES.PARAGRAPH:
        return { size: 'normal' };
      default:
        return {};
    }
  };

  const updateBlock = (id, updates) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const deleteBlock = (id) => {
    if (window.confirm('Excluir este bloco?')) {
      setBlocks(blocks.filter(block => block.id !== id));
    }
  };

  const renderBlockEditor = (block, index) => {
    switch (block.type) {
      case BLOCK_TYPES.PARAGRAPH:
        return (
          <div className="block-editor__paragraph">
            <div className="block-editor__size-control">
              <label>Tamanho do texto:</label>
              <select
                className="block-editor__select block-editor__select--inline"
                value={block.settings?.size || 'normal'}
                onChange={(e) => updateBlock(block.id, {
                  settings: { ...block.settings, size: e.target.value }
                })}
              >
                <option value="small">Pequeno</option>
                <option value="normal">Normal</option>
                <option value="large">Grande</option>
              </select>
            </div>
            <textarea
              className={`block-editor__textarea block-editor__textarea--${block.settings?.size || 'normal'}`}
              placeholder="Escreva seu parágrafo aqui..."
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              rows={4}
            />
          </div>
        );

      case BLOCK_TYPES.HEADING:
        return (
          <div className="block-editor__heading">
            <div className="block-editor__heading-controls">
              <select
                className="block-editor__select"
                value={block.settings.level}
                onChange={(e) => updateBlock(block.id, {
                  settings: { ...block.settings, level: e.target.value }
                })}
              >
                <option value="h1">Título 1 (Maior)</option>
                <option value="h2">Título 2</option>
                <option value="h3">Título 3</option>
                <option value="h4">Título 4</option>
                <option value="h5">Título 5</option>
                <option value="h6">Título 6 (Menor)</option>
              </select>
            </div>
            <input
              type="text"
              className={`block-editor__input block-editor__input--${block.settings.level}`}
              placeholder="Digite o título..."
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            />
          </div>
        );

      case BLOCK_TYPES.IMAGE:
        return (
          <div className="block-editor__image">
            <input
              type="url"
              className="block-editor__input"
              placeholder="URL da imagem"
              value={block.settings.url}
              onChange={(e) => updateBlock(block.id, {
                settings: { ...block.settings, url: e.target.value }
              })}
            />
            <input
              type="text"
              className="block-editor__input"
              placeholder="Texto alternativo (alt)"
              value={block.settings.alt}
              onChange={(e) => updateBlock(block.id, {
                settings: { ...block.settings, alt: e.target.value }
              })}
            />
            <input
              type="text"
              className="block-editor__input"
              placeholder="Legenda (opcional)"
              value={block.settings.caption}
              onChange={(e) => updateBlock(block.id, {
                settings: { ...block.settings, caption: e.target.value }
              })}
            />
            <div className="block-editor__size-control">
              <label>Tamanho da imagem:</label>
              <select
                className="block-editor__select block-editor__select--inline"
                value={block.settings.size || 'medium'}
                onChange={(e) => updateBlock(block.id, {
                  settings: { ...block.settings, size: e.target.value }
                })}
              >
                <option value="small">Pequena (400px)</option>
                <option value="medium">Média (600px)</option>
                <option value="large">Grande (800px)</option>
                <option value="full">Tela Cheia (100%)</option>
              </select>
            </div>
            {block.settings.url && (
              <img
                src={block.settings.url}
                alt={block.settings.alt}
                className={`block-editor__image-preview block-editor__image-preview--${block.settings.size || 'medium'}`}
              />
            )}
          </div>
        );

      case BLOCK_TYPES.VIDEO:
        return (
          <div className="block-editor__video">
            <input
              type="url"
              className="block-editor__input"
              placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
              value={block.settings.url}
              onChange={(e) => updateBlock(block.id, {
                settings: { ...block.settings, url: e.target.value }
              })}
            />
            <div className="block-editor__size-control">
              <label>Tamanho do vídeo:</label>
              <select
                className="block-editor__select block-editor__select--inline"
                value={block.settings.size || 'medium'}
                onChange={(e) => updateBlock(block.id, {
                  settings: { ...block.settings, size: e.target.value }
                })}
              >
                <option value="small">Pequeno</option>
                <option value="medium">Médio</option>
                <option value="large">Grande</option>
                <option value="full">Tela Cheia</option>
              </select>
            </div>
            {block.settings.url && (
              <div className={`block-editor__video-preview block-editor__video-preview--${block.settings.size || 'medium'}`}>
                <iframe
                  src={block.settings.url.replace('watch?v=', 'embed/')}
                  frameBorder="0"
                  allowFullScreen
                  title="Video preview"
                />
              </div>
            )}
          </div>
        );

      case BLOCK_TYPES.QUOTE:
        return (
          <div className="block-editor__quote">
            <textarea
              className="block-editor__textarea"
              placeholder="Digite a citação..."
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              rows={3}
            />
            <input
              type="text"
              className="block-editor__input"
              placeholder="Autor (opcional)"
              value={block.settings.author || ''}
              onChange={(e) => updateBlock(block.id, {
                settings: { ...block.settings, author: e.target.value }
              })}
            />
          </div>
        );

      case BLOCK_TYPES.LIST:
        return (
          <div className="block-editor__list">
            <div className="block-editor__list-controls">
              <button
                type="button"
                className={`block-editor__list-btn ${!block.settings.ordered ? 'active' : ''}`}
                onClick={() => updateBlock(block.id, {
                  settings: { ...block.settings, ordered: false }
                })}
              >
                • Lista
              </button>
              <button
                type="button"
                className={`block-editor__list-btn ${block.settings.ordered ? 'active' : ''}`}
                onClick={() => updateBlock(block.id, {
                  settings: { ...block.settings, ordered: true }
                })}
              >
                1. Numerada
              </button>
            </div>
            <textarea
              className="block-editor__textarea"
              placeholder="Um item por linha"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              rows={5}
            />
          </div>
        );

      case BLOCK_TYPES.CODE:
        return (
          <textarea
            className="block-editor__textarea block-editor__textarea--code"
            placeholder="Cole seu código aqui..."
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            rows={8}
            spellCheck={false}
          />
        );

      default:
        return null;
    }
  };

  const renderBlockPreview = (block) => {
    switch (block.type) {
      case BLOCK_TYPES.PARAGRAPH:
        return <p className={`preview-text--${block.settings?.size || 'normal'}`}>{block.content}</p>;

      case BLOCK_TYPES.HEADING:
        const HeadingTag = block.settings.level;
        return <HeadingTag>{block.content}</HeadingTag>;

      case BLOCK_TYPES.IMAGE:
        return (
          <figure className={`preview-image--${block.settings.size || 'medium'}`}>
            <img src={block.settings.url} alt={block.settings.alt} />
            {block.settings.caption && <figcaption>{block.settings.caption}</figcaption>}
          </figure>
        );

      case BLOCK_TYPES.VIDEO:
        return (
          <div className="video-container">
            <iframe
              src={block.settings.url.replace('watch?v=', 'embed/')}
              frameBorder="0"
              allowFullScreen
              title="Video"
            />
          </div>
        );

      case BLOCK_TYPES.QUOTE:
        return (
          <blockquote>
            <p>{block.content}</p>
            {block.settings.author && <cite>— {block.settings.author}</cite>}
          </blockquote>
        );

      case BLOCK_TYPES.LIST:
        const ListTag = block.settings.ordered ? 'ol' : 'ul';
        const items = block.content.split('\n').filter(item => item.trim());
        return (
          <ListTag>
            {items.map((item, i) => <li key={i}>{item}</li>)}
          </ListTag>
        );

      case BLOCK_TYPES.CODE:
        return <pre><code>{block.content}</code></pre>;

      default:
        return null;
    }
  };

  const getBlockIcon = (type) => {
    switch (type) {
      case BLOCK_TYPES.PARAGRAPH: return <FiAlignLeft />;
      case BLOCK_TYPES.HEADING: return <FiType />;
      case BLOCK_TYPES.IMAGE: return <FiImage />;
      case BLOCK_TYPES.VIDEO: return <FiVideo />;
      case BLOCK_TYPES.QUOTE: return <FiAlignLeft />;
      case BLOCK_TYPES.LIST: return <FiList />;
      case BLOCK_TYPES.CODE: return <FiCode />;
      default: return <FiPlus />;
    }
  };

  const getBlockLabel = (type) => {
    switch (type) {
      case BLOCK_TYPES.PARAGRAPH: return 'Parágrafo';
      case BLOCK_TYPES.HEADING: return 'Título';
      case BLOCK_TYPES.IMAGE: return 'Imagem';
      case BLOCK_TYPES.VIDEO: return 'Vídeo';
      case BLOCK_TYPES.QUOTE: return 'Citação';
      case BLOCK_TYPES.LIST: return 'Lista';
      case BLOCK_TYPES.CODE: return 'Código';
      default: return '';
    }
  };

  return (
    <div className="block-editor">
      <div className="block-editor__toolbar">
        <button
          type="button"
          className={`block-editor__mode-btn ${!previewMode ? 'active' : ''}`}
          onClick={() => setPreviewMode(false)}
        >
          <FiEdit3 size={16} /> Editor
        </button>
        <button
          type="button"
          className={`block-editor__mode-btn ${previewMode ? 'active' : ''}`}
          onClick={() => setPreviewMode(true)}
        >
          <FiEye size={16} /> Preview
        </button>
      </div>

      {!previewMode ? (
        <div className="block-editor__canvas">
          {blocks.map((block, index) => (
            <div key={block.id} className="block-editor__block">
              <div className="block-editor__block-header">
                <div className="block-editor__block-label">
                  {getBlockIcon(block.type)}
                  <span>{getBlockLabel(block.type)}</span>
                </div>
                <div className="block-editor__block-controls">
                  <button
                    type="button"
                    className="block-editor__control-btn"
                    onClick={() => moveBlock(index, 'up')}
                    disabled={index === 0}
                    title="Mover para cima"
                  >
                    <FiChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="block-editor__control-btn"
                    onClick={() => moveBlock(index, 'down')}
                    disabled={index === blocks.length - 1}
                    title="Mover para baixo"
                  >
                    <FiChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    className="block-editor__control-btn block-editor__control-btn--delete"
                    onClick={() => deleteBlock(block.id)}
                    title="Excluir bloco"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="block-editor__block-content">
                {renderBlockEditor(block, index)}
              </div>
            </div>
          ))}

          <div className="block-editor__add-block">
            {!showBlockMenu ? (
              <button
                type="button"
                className="block-editor__add-btn"
                onClick={() => setShowBlockMenu(true)}
              >
                <FiPlus size={20} /> Adicionar Bloco
              </button>
            ) : (
              <div className="block-editor__block-menu">
                <button onClick={() => addBlock(BLOCK_TYPES.PARAGRAPH)}>
                  <FiAlignLeft /> Parágrafo
                </button>
                <button onClick={() => addBlock(BLOCK_TYPES.HEADING)}>
                  <FiType /> Título
                </button>
                <button onClick={() => addBlock(BLOCK_TYPES.IMAGE)}>
                  <FiImage /> Imagem
                </button>
                <button onClick={() => addBlock(BLOCK_TYPES.VIDEO)}>
                  <FiVideo /> Vídeo
                </button>
                <button onClick={() => addBlock(BLOCK_TYPES.QUOTE)}>
                  <FiAlignLeft /> Citação
                </button>
                <button onClick={() => addBlock(BLOCK_TYPES.LIST)}>
                  <FiList /> Lista
                </button>
                <button onClick={() => addBlock(BLOCK_TYPES.CODE)}>
                  <FiCode /> Código
                </button>
                <button
                  className="block-editor__block-menu-close"
                  onClick={() => setShowBlockMenu(false)}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {blocks.length === 0 && (
            <div className="block-editor__empty">
              <FiPlus size={48} />
              <p>Clique em "Adicionar Bloco" para começar a criar seu conteúdo</p>
            </div>
          )}
        </div>
      ) : (
        <div className="block-editor__preview">
          {blocks.map(block => (
            <div key={block.id} className="block-editor__preview-block">
              {renderBlockPreview(block)}
            </div>
          ))}
          {blocks.length === 0 && (
            <p className="block-editor__preview-empty">
              Adicione blocos para ver o preview
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockEditor;

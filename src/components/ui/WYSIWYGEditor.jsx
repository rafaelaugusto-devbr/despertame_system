import React, { useRef, useEffect } from 'react';
import { FiBold, FiItalic, FiUnderline, FiLink, FiList, FiType, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi';

const WYSIWYGEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Digite a URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const changeFontSize = () => {
    const size = prompt('Digite o tamanho da fonte (1-7):', '3');
    if (size && size >= 1 && size <= 7) {
      execCommand('fontSize', size);
    }
  };

  const changeFontFamily = () => {
    const font = prompt('Digite o nome da fonte:', 'Arial');
    if (font) {
      execCommand('fontName', font);
    }
  };

  const changeColor = () => {
    const color = prompt('Digite a cor (nome ou código hex):', '#000000');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  return (
    <div style={{ border: '2px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        padding: '0.75rem',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <button
          type="button"
          onClick={() => execCommand('bold')}
          style={toolbarButtonStyle}
          title="Negrito (Ctrl+B)"
        >
          <FiBold />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          style={toolbarButtonStyle}
          title="Itálico (Ctrl+I)"
        >
          <FiItalic />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          style={toolbarButtonStyle}
          title="Sublinhado (Ctrl+U)"
        >
          <FiUnderline />
        </button>

        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 0.25rem' }} />

        <button
          type="button"
          onClick={insertLink}
          style={toolbarButtonStyle}
          title="Inserir Link"
        >
          <FiLink />
        </button>

        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 0.25rem' }} />

        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          style={toolbarButtonStyle}
          title="Lista com marcadores"
        >
          <FiList />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          style={toolbarButtonStyle}
          title="Lista numerada"
        >
          <FiList style={{ transform: 'scaleX(-1)' }} />
        </button>

        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 0.25rem' }} />

        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          style={toolbarButtonStyle}
          title="Alinhar à esquerda"
        >
          <FiAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          style={toolbarButtonStyle}
          title="Centralizar"
        >
          <FiAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          style={toolbarButtonStyle}
          title="Alinhar à direita"
        >
          <FiAlignRight />
        </button>

        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 0.25rem' }} />

        <button
          type="button"
          onClick={changeFontSize}
          style={toolbarButtonStyle}
          title="Tamanho da fonte"
        >
          <FiType />
        </button>
        <button
          type="button"
          onClick={changeFontFamily}
          style={{ ...toolbarButtonStyle, fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
          title="Fonte"
        >
          Font
        </button>
        <button
          type="button"
          onClick={changeColor}
          style={{ ...toolbarButtonStyle, fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
          title="Cor do texto"
        >
          Cor
        </button>

        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 0.25rem' }} />

        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h1>')}
          style={{ ...toolbarButtonStyle, fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
          title="Título 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          style={{ ...toolbarButtonStyle, fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
          title="Título 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          style={{ ...toolbarButtonStyle, fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
          title="Título 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          style={{ ...toolbarButtonStyle, fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
          title="Parágrafo"
        >
          P
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          minHeight: '400px',
          maxHeight: '600px',
          overflowY: 'auto',
          padding: '1.5rem',
          fontSize: '1rem',
          lineHeight: '1.6',
          background: '#ffffff',
          outline: 'none',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}
        suppressContentEditableWarning
      />

      <style>{`
        [contenteditable]:focus {
          outline: none;
        }

        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }

        [contenteditable] h1 {
          font-size: 2em;
          margin: 0.67em 0;
          font-weight: bold;
        }

        [contenteditable] h2 {
          font-size: 1.5em;
          margin: 0.75em 0;
          font-weight: bold;
        }

        [contenteditable] h3 {
          font-size: 1.17em;
          margin: 0.83em 0;
          font-weight: bold;
        }

        [contenteditable] p {
          margin: 1em 0;
        }

        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
      `}</style>
    </div>
  );
};

const toolbarButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  border: 'none',
  background: '#ffffff',
  color: '#475569',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '1rem',
};

export default WYSIWYGEditor;

// src/pages/tesouraria/components/InscritoDetalhesModal.jsx
import React, { useState } from 'react';
import { FiX, FiSave, FiEdit2 } from 'react-icons/fi';
import { updateInscritoField } from '../../../services/googleSheetsApi';

const InscritoDetalhesModal = ({ inscrito, evento, ano, headers, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [loading, setLoading] = useState(false);

  // Campos que podem ser editados
  const EDITABLE_FIELDS = ['Status', 'Observação', 'Obs', 'Check-in', 'Responsável', 'Tag', 'Pago'];

  const handleEdit = (campo, valor) => {
    setEditedValues(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSave = async () => {
    if (Object.keys(editedValues).length === 0) {
      setEditMode(false);
      return;
    }

    setLoading(true);
    try {
      // Atualiza cada campo editado
      for (const [campo, valor] of Object.entries(editedValues)) {
        await updateInscritoField({
          evento,
          ano,
          rowIndex: inscrito.rowIndex,
          campo,
          valor,
        });
      }

      onUpdate && onUpdate();
      setEditMode(false);
      setEditedValues({});
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (campo, valor) => {
    const isEditable = EDITABLE_FIELDS.includes(campo);
    const currentValue = editedValues[campo] !== undefined ? editedValues[campo] : valor;

    if (editMode && isEditable) {
      // Campo específico: Status
      if (campo === 'Status') {
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => handleEdit(campo, e.target.value)}
            className="form-input"
          >
            <option value="">Selecione...</option>
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        );
      }

      // Campo específico: Check-in
      if (campo === 'Check-in') {
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => handleEdit(campo, e.target.value)}
            className="form-input"
          >
            <option value="">Não</option>
            <option value="Sim">Sim</option>
            <option value="Presente">Presente</option>
          </select>
        );
      }

      // Campo específico: Pago
      if (campo === 'Pago') {
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => handleEdit(campo, e.target.value)}
            className="form-input"
          >
            <option value="">Não</option>
            <option value="Sim">Sim</option>
            <option value="Parcial">Parcial</option>
          </select>
        );
      }

      // Campo específico: Tag
      if (campo === 'Tag') {
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => handleEdit(campo, e.target.value)}
            className="form-input"
          >
            <option value="">Nenhuma</option>
            <option value="VIP">VIP</option>
            <option value="Bolsa">Bolsa</option>
            <option value="Restrição Alimentar">Restrição Alimentar</option>
            <option value="Necessidade Especial">Necessidade Especial</option>
          </select>
        );
      }

      // Campos de texto
      return (
        <input
          type="text"
          value={currentValue || ''}
          onChange={(e) => handleEdit(campo, e.target.value)}
          className="form-input"
        />
      );
    }

    // Modo visualização
    return <span>{valor || '-'}</span>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalhes do Inscrito</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="inscrito-detalhes">
            <div className="detalhes-header">
              <div>
                <p className="text-sm text-secondary">Evento: {evento}</p>
                <p className="text-sm text-secondary">Ano: {ano}</p>
                <p className="text-sm text-secondary">Linha: {inscrito.rowIndex}</p>
              </div>
              {!editMode ? (
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditMode(true)}
                >
                  <FiEdit2 /> Editar
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditMode(false);
                      setEditedValues({});
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <FiSave /> {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              )}
            </div>

            <div className="detalhes-grid">
              {headers
                .filter(h => h !== 'rowIndex' && h !== 'evento' && h !== 'ano')
                .map((campo) => (
                  <div key={campo} className="detalhe-item">
                    <label className="detalhe-label">
                      {campo}
                      {EDITABLE_FIELDS.includes(campo) && editMode && (
                        <span className="text-xs text-blue"> (editável)</span>
                      )}
                    </label>
                    <div className="detalhe-value">
                      {renderField(campo, inscrito[campo])}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-content--large {
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-body {
          max-height: 70vh;
          overflow-y: auto;
        }

        .inscrito-detalhes {
          padding: 1rem 0;
        }

        .detalhes-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .detalhes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        .detalhe-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detalhe-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: capitalize;
        }

        .detalhe-value {
          font-size: 1rem;
          color: #1e293b;
        }

        .detalhe-value span {
          display: block;
          padding: 0.5rem;
          background: #f8fafc;
          border-radius: 6px;
        }

        .form-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .text-sm {
          font-size: 0.875rem;
        }

        .text-xs {
          font-size: 0.75rem;
        }

        .text-secondary {
          color: #64748b;
        }

        .text-blue {
          color: #3b82f6;
        }

        @media (max-width: 720px) {
          .modal-content--large {
            max-width: 95vw;
            max-height: 95vh;
          }

          .detalhes-grid {
            grid-template-columns: 1fr;
          }

          .detalhes-header {
            flex-direction: column;
            gap: 1rem;
          }

          .detalhes-header button,
          .detalhes-header div {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default InscritoDetalhesModal;

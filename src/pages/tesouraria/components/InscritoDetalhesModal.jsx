// src/pages/tesouraria/components/InscritoDetalhesModal.jsx
import React, { useState } from 'react';
import { FiX, FiSave, FiEdit2 } from 'react-icons/fi';
import { updateInscritoField } from '../../../services/googleSheetsApi';
import './InscritoDetalhesModal.css';

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
        const result = await updateInscritoField({
          evento,
          ano,
          rowIndex: inscrito.rowIndex,
          campo,
          valor,
        });

        if (!result.success) {
          throw new Error(result.message || `Erro ao atualizar campo: ${campo}`);
        }
      }

      alert('✓ Dados atualizados com sucesso!');
      onUpdate && onUpdate();
      setEditMode(false);
      setEditedValues({});
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('✗ Erro ao salvar alterações: ' + error.message);
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
              <div className="detalhes-header-info">
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
                <div className="detalhes-header-actions">
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
    </div>
  );
};

export default InscritoDetalhesModal;

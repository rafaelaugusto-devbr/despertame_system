import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNotification } from '../../hooks/useNotification';
import { handleError } from '../../utils/errorHandler';
import Header from '../../components/layout/Header';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import '../tesouraria/components/CalendarioManager.css';
import './CalendarioVisualizacao.css';

const CalendarioVisualizacao = () => {
  const calendarRef = useRef(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const { showError } = useNotification();

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const eventosQuery = query(
        collection(db, 'calendarioEventos'),
        orderBy('start', 'asc')
      );
      const snapshot = await getDocs(eventosQuery);

      const eventosData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || data.titulo,
          start: data.start?.toDate?.() || data.start,
          end: data.end?.toDate?.() || data.end,
          backgroundColor: data.backgroundColor || data.cor || '#3b82f6',
          borderColor: data.borderColor || data.cor || '#3b82f6',
          allDay: data.allDay !== undefined ? data.allDay : true,
          extendedProps: {
            descricao: data.descricao || data.description,
            local: data.local || data.location,
            tipo: data.tipo || 'evento',
          },
        };
      });

      setEventos(eventosData);
    } catch (error) {
      handleError(error, showError);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info) => {
    setEventoSelecionado({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      ...info.event.extendedProps,
    });
  };

  const fecharModal = () => {
    setEventoSelecionado(null);
  };

  const formatarData = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatarHora = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="calendario-visualizacao">
      <Header
        title="Calendário de Eventos"
        subtitle="Visualização de todos os eventos e datas importantes do sistema."
      />

      <div className="calendario-card">
        {loading ? (
          <div className="calendario-loading">
            <div className="spinner"></div>
            <p>Carregando eventos...</p>
          </div>
        ) : (
          <div className="calendario-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="pt-br"
              events={eventos}
              editable={false}
              selectable={false}
              eventClick={handleEventClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,multiMonthYear',
              }}
              buttonText={{
                today: 'Hoje',
                month: 'Mês',
                year: 'Ano',
              }}
              height="auto"
              multiMonthMaxColumns={3}
              dayMaxEvents={3}
              moreLinkText={(num) => `+${num} eventos`}
            />
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Evento */}
      {eventoSelecionado && (
        <div className="evento-modal-overlay" onClick={fecharModal}>
          <div className="evento-modal" onClick={(e) => e.stopPropagation()}>
            <div className="evento-modal__header">
              <h3>{eventoSelecionado.title}</h3>
              <button className="evento-modal__close" onClick={fecharModal}>
                ×
              </button>
            </div>

            <div className="evento-modal__body">
              <div className="evento-modal__info">
                <FiCalendar className="evento-modal__icon" />
                <div>
                  <strong>Data:</strong>
                  <p>{formatarData(eventoSelecionado.start)}</p>
                </div>
              </div>

              {!eventoSelecionado.allDay && eventoSelecionado.start && (
                <div className="evento-modal__info">
                  <FiClock className="evento-modal__icon" />
                  <div>
                    <strong>Horário:</strong>
                    <p>
                      {formatarHora(eventoSelecionado.start)}
                      {eventoSelecionado.end && ` - ${formatarHora(eventoSelecionado.end)}`}
                    </p>
                  </div>
                </div>
              )}

              {eventoSelecionado.local && (
                <div className="evento-modal__info">
                  <FiMapPin className="evento-modal__icon" />
                  <div>
                    <strong>Local:</strong>
                    <p>{eventoSelecionado.local}</p>
                  </div>
                </div>
              )}

              {eventoSelecionado.descricao && (
                <div className="evento-modal__descricao">
                  <strong>Descrição:</strong>
                  <p>{eventoSelecionado.descricao}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioVisualizacao;

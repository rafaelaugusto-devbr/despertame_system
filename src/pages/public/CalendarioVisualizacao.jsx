import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';

import '../tesouraria/components/CalendarioManager.css';

/* ===============================
   EVENTOS MOCK (VISUAL ONLY)
================================= */
const eventosMock = [
  {
    id: '1',
    title: 'Reunião Geral',
    start: '2025-27-12',
    allDay: true,
    backgroundColor: '#ff8c00',
    borderColor: '#ff8c00',
  },
  {
    id: '2',
    title: 'Treinamento',
    start: '2025-01-18',
    allDay: true,
    backgroundColor: '#3182ce',
    borderColor: '#3182ce',
  },
  {
    id: 'feriado-1',
    title: 'Feriado Nacional',
    start: '2025-01-25',
    allDay: true,
    display: 'background',
    backgroundColor: '#c1c1c1',
    borderColor: '#c1c1c1',
    className: 'evento-feriado',
    editable: false
  }
];

const CalendarioVisualizacao = () => {
  const calendarRef = useRef(null);

  const irParaMes = (data) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(data);
      api.changeView('dayGridMonth');
    }
  };

  const handleDatesSet = (arg) => {
    const api = calendarRef.current?.getApi();
    if (!api || arg.view.type !== 'multiMonthYear') return;

    api.getEvents()
      .filter(e => e.extendedProps?.isMonthTitle)
      .forEach(e => e.remove());

    const year = arg.view.currentStart.getFullYear();

    for (let i = 0; i < 12; i++) {
      const date = new Date(year, i, 1);
      api.addEvent({
        id: `month-${year}-${i}`,
        title: date.toLocaleString('pt-BR', { month: 'long' }),
        start: date,
        allDay: true,
        display: 'list-item',
        editable: false,
        extendedProps: { isMonthTitle: true }
      });
    }
  };

  const renderEventContent = (info) => {
    if (info.event.extendedProps?.isMonthTitle) {
      if (info.view.type === 'multiMonthYear') {
        return (
          <div
            className="custom-month-title"
            onClick={() => irParaMes(info.event.start)}
          >
            {info.event.title}
          </div>
        );
      }
      return null;
    }

    return (
      <div className={info.event.classNames.join(' ')}>
        <i>{info.event.title}</i>
      </div>
    );
  };

  return (
    <div className="link-card">
      <h2 className="link-title">Calendário de Eventos</h2>

      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
        Visualização geral de eventos e datas importantes.
      </p>

      <div className="calendario-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="pt-br"
          events={eventosMock}
          editable={false}
          selectable={false}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,multiMonthYear'
          }}
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            year: 'Ano'
          }}
          multiMonthMaxColumns={3}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
        />
      </div>
    </div>
  );
};

export default CalendarioVisualizacao;

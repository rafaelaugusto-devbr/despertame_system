// src/components/CalendarioManager.js

import React, { useState, useEffect, useRef } from 'react';
// ... (imports)
import { db } from '../../../services/firebase';
import { collection, addDoc, updateDoc, getDocs, doc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import EventModal from '../../../components/modal/EventModal';
import CategoryModal from '../../../components/modal/CategoryModal';
import Button from '../../../components/ui/Button';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import './CalendarioManager.css';


const CATEGORIA_FERIADO = {
    id: 'feriado-nacional',
    name: 'Feriado Nacional',
    backgroundColor: '#c1c1c1',
    borderColor: '#c1c1c1',
    display: 'background',
    editable: false,
    className: 'evento-feriado'
};

const formatarEventoDoFirebase = (doc, allCategories) => {
    const eventData = doc.data();
    const category = allCategories.find(cat => cat.id === eventData.categoryId);
    return {
        id: doc.id,
        title: eventData.title,
        start: eventData.start.toDate(),
        allDay: eventData.allDay,
        backgroundColor: category ? category.color : '#3788d8',
        borderColor: category ? category.color : '#3788d8',
        extendedProps: { categoryId: eventData.categoryId }
    };
};

const CalendarioManager = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventModalInfo, setEventModalInfo] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [error, setError] = useState(null);

    const calendarRef = useRef(null);
    const feriadosRef = useRef([]);
    // CORREÇÃO STRICT MODE: Ref para garantir que o fetch inicial rode apenas uma vez.
    const effectRan = useRef(false);

    const eventsCollectionRef = collection(db, 'calendarioEventos');
    const categoriesCollectionRef = collection(db, 'calendarioCategorias');

    const irParaMes = (data) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.gotoDate(data);
            calendarApi.changeView('dayGridMonth');
        }
    };

    const handleDatesSet = (arg) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi && arg.view.type === 'multiMonthYear') {
            const oldTitleEvents = calendarApi.getEvents().filter(e => e.extendedProps.isMonthTitle);
            oldTitleEvents.forEach(event => event.remove());

            const year = arg.view.currentStart.getFullYear();
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(year, i, 1);
                calendarApi.addEvent({
                    id: `month-title-${year}-${i}`,
                    title: monthDate.toLocaleString('pt-BR', { month: 'long' }),
                    start: monthDate,
                    allDay: true,
                    display: 'list-item',
                    extendedProps: { isMonthTitle: true }
                });
            }
        }
    };

    const renderEventContent = (eventInfo) => {
        if (eventInfo.event.extendedProps.isMonthTitle) {
            if (eventInfo.view.type === 'multiMonthYear') {
                return (
                    <div className="custom-month-title" onClick={() => irParaMes(eventInfo.event.start)}>
                        {eventInfo.event.title}
                    </div>
                );
            }
            return null;
        }
        return (
            <div className={eventInfo.event.classNames.join(' ')}>
                <i>{eventInfo.event.title}</i>
            </div>
        );
    };

    const buscarFeriadosEmMassa = async (anoInicial, anoFinal) => {
        // ... (código sem alterações)
        const promessas = [];
        for (let ano = anoInicial; ano <= anoFinal; ano++) {
            promessas.push(fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}` ));
        }
        try {
            const respostas = await Promise.all(promessas);
            for (const resposta of respostas) {
                if (!resposta.ok) throw new Error("Falha ao buscar feriados.");
            }
            const dadosAnuais = await Promise.all(respostas.map(r => r.json()));
            return dadosAnuais.flat().map(feriado => ({
                id: `feriado-${feriado.date}`, title: feriado.name, start: feriado.date, allDay: true, ...CATEGORIA_FERIADO
            }));
        } catch (err) {
            console.error("Erro no carregamento em massa de feriados:", err);
            setError("Não foi possível carregar a lista completa de feriados.");
            return [];
        }
    };

    // CORREÇÃO STRICT MODE: useEffect agora usa a trava 'effectRan'.
    useEffect(() => {
        // Só executa se não tiver rodado antes (ou em produção).
        if (effectRan.current === false) {
            const fetchInitialData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const categoriesData = await getDocs(query(categoriesCollectionRef, orderBy('name')));
                    const dbCategories = categoriesData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCategories(dbCategories);

                    const eventsData = await getDocs(eventsCollectionRef);
                    const dbEvents = eventsData.docs.map(doc => formatarEventoDoFirebase(doc, dbCategories));

                    const anoAtual = new Date().getFullYear();
                    const todosOsFeriados = await buscarFeriadosEmMassa(anoAtual, 2035);
                    feriadosRef.current = todosOsFeriados;

                    setEvents([...dbEvents, ...todosOsFeriados]);
                } catch (err) {
                    console.error("Erro crítico ao carregar dados iniciais:", err);
                    setError("Falha ao carregar dados do calendário.");
                } finally {
                    setLoading(false);
                }
            };

            fetchInitialData();
        }

        // Marca que o efeito rodou e define a função de cleanup.
        return () => {
            effectRan.current = true;
        };
    }, []); // Array de dependências vazio, como deve ser.

    const reloadFirebaseData = async () => {
        // ... (código sem alterações)
        const categoriesData = await getDocs(query(categoriesCollectionRef, orderBy('name')));
        const dbCategories = categoriesData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(dbCategories);

        const eventsData = await getDocs(eventsCollectionRef);
        const dbEvents = eventsData.docs.map(doc => formatarEventoDoFirebase(doc, dbCategories));
        
        setEvents([...dbEvents, ...feriadosRef.current]);
    };

    const handleEventClick = (arg) => {
        // ... (código sem alterações)
        if (arg.event.extendedProps.isMonthTitle || arg.event.extendedProps.editable === false) {
            return;
        }
        setEventModalInfo({ isEditing: true, event: arg.event });
    };

    const handleDateClick = (arg) => setEventModalInfo({ isEditing: false, dateInfo: arg });
    const handleCloseEventModal = () => setEventModalInfo(null);

    const handleSaveEvent = async (title, categoryId) => {
        // ... (código sem alterações)
        if (!eventModalInfo || !title.trim()) return;
        const eventData = {
            title: title.trim(),
            categoryId: categoryId || null,
        };
        try {
            if (eventModalInfo.isEditing) {
                await updateDoc(doc(db, 'calendarioEventos', eventModalInfo.event.id), eventData);
            } else {
                const newEventPayload = {
                    ...eventData,
                    start: eventModalInfo.dateInfo.date,
                    allDay: eventModalInfo.dateInfo.allDay,
                    createdAt: serverTimestamp()
                };
                await addDoc(eventsCollectionRef, newEventPayload);
            }
            await reloadFirebaseData();
            handleCloseEventModal();
        } catch (error) {
            console.error("ERRO AO SALVAR NO FIREBASE:", error);
            setError("Ocorreu um erro ao salvar o evento. Tente novamente.");
        }
    };

    const handleDeleteEvent = async () => {
        // ... (código sem alterações)
        if (!eventModalInfo || !eventModalInfo.isEditing) return;
        try {
            await deleteDoc(doc(db, 'calendarioEventos', eventModalInfo.event.id));
            await reloadFirebaseData();
            handleCloseEventModal();
        } catch (error) {
            console.error("ERRO AO DELETAR NO FIREBASE:", error);
            setError("Ocorreu um erro ao excluir o evento.");
        }
    };
    
    const handleAddCategory = async (name, color) => {
        // ... (código sem alterações)
        await addDoc(categoriesCollectionRef, { name, color });
        await reloadFirebaseData();
        setIsCategoryModalOpen(false);
    };

    const handleDeleteCategory = async (categoryId) => {
        // ... (código sem alterações)
        if (window.confirm("Excluir esta categoria?")) {
            await deleteDoc(doc(db, 'calendarioEventos', categoryId));
            await reloadFirebaseData();
        }
    };

    return (
        <>
            <div className="link-card">
                <h2 className="link-title">Calendário de Eventos</h2>
                {error && <p style={{ color: '#e53e3e', backgroundColor: '#fff5f5', border: '1px solid #e53e3e', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>{error}</p>}
                <p style={{color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)'}}>
                    Clique em uma data para adicionar um novo evento. Clique em um evento existente para editar.
                </p>
                <div className="calendario-container">
                    {loading ? <p>Carregando calendário e feriados...</p> : (
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin, multiMonthPlugin]}
                            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,multiMonthYear' }}
                            initialView="dayGridMonth"
                            locale="pt-br"
                            buttonText={{ today: 'Hoje', month: 'Mês', year: 'Ano' }}
                            multiMonthMaxColumns={3}
                            events={events}
                            dateClick={handleDateClick}
                            eventClick={handleEventClick}
                            
                            ref={calendarRef}
                            datesSet={handleDatesSet}
                            eventContent={renderEventContent}
                        />
                    )}
                </div>
            </div>

            <div className="link-card" style={{marginTop: 'var(--spacing-lg)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2 className="link-title">Categorias de Eventos</h2>
                    <Button className="btn-primary btn-small" onClick={() => setIsCategoryModalOpen(true)}>
                        <FiPlus /> Nova Categoria
                    </Button>
                </div>
                <div className="category-list">
                    {categories.map(cat => (
                        <div key={cat.id} className="category-item">
                            <span className="category-color-dot" style={{ backgroundColor: cat.color }}></span>
                            <span>{cat.name}</span>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="icon-btn delete" title="Excluir Categoria">
                                <FiTrash2 />
                            </button>
                        </div>
                    ))}
                    {categories.length === 0 && !loading && <p className="empty-message" style={{padding: 0, textAlign: 'left'}}>Nenhuma categoria criada.</p>}
                </div>
            </div>

            <EventModal 
                eventInfo={eventModalInfo}
                categories={categories}
                onClose={handleCloseEventModal}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
            />
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSave={handleAddCategory}
            />
        </>
    );
};

export default CalendarioManager;

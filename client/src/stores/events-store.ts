import { getApiErrorMessage } from "@/lib/utils";
import { eventsApi } from "@/shared/api/events-api";
import { meApi } from "@/shared/api/me-api";
import type { CreateEventRequest, EventDto, JoinedEventItem, UpdateEventRequest } from "@/shared/api/types";
import { create } from "zustand";

export type MyEventsFilter = 'created' | 'joined'

type EventsState = {
    events: EventDto[]
    joinedEvents: JoinedEventItem[]
    myEventsFilter: MyEventsFilter

    eventsLoading: boolean
    joinedLoading: boolean
    mutationLoading: boolean
    evetnsError: string | null

    setMyEventsFilter: (fileter: MyEventsFilter) => void
    loadEvents: () => Promise<void>
    loadJoinedEvents: () => Promise<void>
    createEvent: (payload: CreateEventRequest) => Promise<EventDto>
    updateEvent: (id: string, payload: UpdateEventRequest) => Promise<EventDto>
    removeEvent: (id: string) => Promise<void>
    joinEvent: (id: string) => Promise<void>
    leaveEvent: (id: string) => Promise<void>
}

export const useEventsStore = create<EventsState>((set, get) => ({
    events: [],
    joinedEvents: [],
    myEventsFilter: 'created',
    eventsLoading: false,
    joinedLoading: false,
    mutationLoading: false,
    evetnsError: null,
    setMyEventsFilter: (filter) => set({ myEventsFilter: filter}),
    loadEvents: async () => {
        set({ eventsLoading: true, evetnsError: null })

        try {
            const list = await eventsApi.list()
            set({ events: list, eventsLoading: false })
        } catch (error) {
            set({
                eventsLoading: false,
                evetnsError: getApiErrorMessage(error, 'Не удалось загрузить события')
            })

            throw error
        }
    },

    loadJoinedEvents: async () => {
        set({ joinedLoading: true, evetnsError: null })

        try {
            const list = await meApi.joinedEvents();
            set({ joinedEvents: list, joinedLoading: false })
        } catch (error) {
            set({
                joinedLoading: false,
                evetnsError: getApiErrorMessage(error, 'Не удалось загрузить участие')
            })

            throw error
        }
    },

    createEvent: async (payload) => {
        set({ mutationLoading: true, evetnsError: null })

        try {
            const created = await eventsApi.create(payload)

            set((s) => ({
                events: [...s.events, created].sort((a,b) => a.startsAt.localeCompare(b.startsAt)),
                mutationLoading: false
            }))

            return created
        } catch (error) {
            set({
                mutationLoading: false,
                evetnsError: getApiErrorMessage(error, 'Не удалось создать событие')
            })

            throw error
        }
    },

    updateEvent: async (id, payload) => {
        set({ mutationLoading: true, evetnsError: null })

        try {
           const updated = await eventsApi.update(id, payload);
           
           set((s) => ({
                events: s.events
                    .map(event => event.id === id ? updated : event)
                    .sort((a,b) => a.startsAt.localeCompare(b.startsAt)),
                joinedEvents: s.joinedEvents
                    .map(row => row.event.id === id ? { ...row, event: updated} : row),
                mutationLoading: false
           }))

           return updated
        } catch (error) {
            set({
                mutationLoading: false,
                evetnsError: getApiErrorMessage(error, 'Не удалось обновить событие')
            })

            throw error
        }
    },

    removeEvent: async (id) => {
        set({ mutationLoading: true, evetnsError: null })

        try {
            await eventsApi.remove(id)

            set((s) => ({
                events: s.events.filter(event => event.id !== id),
                joinedEvents: s.joinedEvents.filter(row => row.event.id !== id),
                mutationLoading: false
            }))
        } catch (error) {
            set({
                mutationLoading: false,
                evetnsError: getApiErrorMessage(error, 'Не удалось удалить событие')
            })

            throw error
        }
    },

    joinEvent: async (id) => {
        set({ mutationLoading: true, evetnsError: null })

        try {
            await eventsApi.join(id);
            await get().loadJoinedEvents();
            set({ mutationLoading: false})
        } catch (error) {
            set({
                mutationLoading: false,
                evetnsError: getApiErrorMessage(error, 'Не удалось присоединиться')
            })

            throw error
        }
    },

    leaveEvent: async (id) => {
        set({ mutationLoading: true, evetnsError: null })

        try {
            await eventsApi.leave(id);

            set((s) => ({
                joinedEvents: s.joinedEvents.filter(row => row.event.id !== id),
                mutationLoading: false
            }))
        } catch (error) {
            set({
                mutationLoading: false,
                evetnsError: getApiErrorMessage(error, 'Не удалось выйти из события')
            })

            throw error
        }
    }

}))
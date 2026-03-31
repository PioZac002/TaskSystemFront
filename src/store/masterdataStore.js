import { create } from "zustand";
import apiClient from "@/services/apiClient";

export const useMasterdataStore = create((set, get) => ({
    masterdata: [],
    loading: false,
    error: null,

    fetchAll: async () => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.get('/api/v1/masterdata');
            const raw = res.data;
            const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.value) ? raw.value : (Array.isArray(raw?.items) ? raw.items : []));
            set({ masterdata: arr, loading: false });
        } catch (e) {
            set({ error: e.message, loading: false });
        }
    },

    fetchByType: async (type) => {
        try {
            const res = await apiClient.get('/api/v1/masterdata/type', { params: { type } });
            const raw = res.data;
            return Array.isArray(raw) ? raw : (Array.isArray(raw?.value) ? raw.value : (Array.isArray(raw?.items) ? raw.items : []));
        } catch (e) {
            console.error('Error fetching masterdata by type:', e);
            return [];
        }
    },

    saveValue: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.post('/api/v1/masterdata', data);
            await get().fetchAll();
            set({ loading: false });
            return res.data;
        } catch (e) {
            set({ error: e.message, loading: false });
            throw e;
        }
    },

    deleteValue: async (id) => {
        set({ loading: true, error: null });
        try {
            await apiClient.post('/api/v1/masterdata', { id, delete: true });
            set({
                masterdata: get().masterdata.filter(m => m.id !== id),
                loading: false
            });
        } catch (e) {
            set({ error: e.message, loading: false });
            throw e;
        }
    },
}));

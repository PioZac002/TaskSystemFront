import { create } from "zustand";
import apiClient from "@/services/apiClient";

export const useUserStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,

    fetchUsers: async () => {
        set({ loading: true, error:  null });
        try {
            const response = await apiClient.get('/api/v1/user/all');
            set({ users:  response.data, loading: false });
        } catch (e) {
            console.error('Error fetching users:', e);
            set({ error: e.message || "Failed to fetch users", loading: false });
        }
    },

    fetchUserById: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.get(`/api/v1/user/${id}`);
            set({ loading: false });
            return response.data;
        } catch (e) {
            console.error('Error fetching user:', e);
            set({ error: e.message || "Failed to fetch user", loading: false });
            throw e;
        }
    },

    deleteUser: async (id) => {
        set({ loading: true, error: null });
        try {
            await apiClient.delete(`/api/v1/user/${id}`);
            set({
                users: get().users.filter(u => u.id !== id),
                loading: false
            });
        } catch (e) {
            console.error('Error deleting user:', e);
            set({ error: e. message || "Failed to delete user", loading: false });
            throw e;
        }
    }
}));
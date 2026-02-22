import { create } from "zustand";
import apiClient from "@/services/apiClient";

export const useUserStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,

    fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.get('/api/v1/user/all');
            set({ users: response.data, loading: false });
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

    updateUser: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.put(`/api/v1/user/${id}`, data);
            // Update the cached user in the users list if present
            set({
                users: get().users.map(u => u.id === id ? response.data : u),
                loading: false
            });
            return response.data;
        } catch (e) {
            console.error('Error updating user:', e);
            set({ error: e.message || "Failed to update user", loading: false });
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
            set({ error: e.message || "Failed to delete user", loading: false });
            throw e;
        }
    }
}));

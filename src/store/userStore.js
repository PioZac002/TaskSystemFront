import { create } from "zustand";
import userApi from "@/services/userApi";

export const useUserStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,
    
    fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
            const data = await userApi.getAll();
            set({ users: data, loading: false });
        } catch (e) {
            set({ error: e.message || "Failed to fetch users", loading: false });
        }
    },
    
    fetchUserById: async (id) => {
        set({ loading: true, error: null });
        try {
            const data = await userApi.getById(id);
            set({ loading: false });
            return data;
        } catch (e) {
            set({ error: e.message || "Failed to fetch user", loading: false });
            throw e;
        }
    },
    
    deleteUser: async (id) => {
        set({ loading: true, error: null });
        try {
            await userApi.deleteUser(id);
            set({ 
                users: get().users.filter(u => u.id !== id),
                loading: false 
            });
        } catch (e) {
            set({ error: e.message || "Failed to delete user", loading: false });
            throw e;
        }
    }
}));

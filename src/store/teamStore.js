import { create } from "zustand";
import apiClient from "@/services/apiClient";

export const useTeamStore = create((set, get) => ({
    teams: [],
    loading:  false,
    error: null,

    fetchTeams:  async () => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.get('/api/v1/team/all');
            set({ teams: response. data, loading: false });
        } catch (e) {
            console.error('Error fetching teams:', e);
            set({ error: e.message || "Failed to fetch teams", loading: false });
        }
    },

    createTeam: async (teamData) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.post('/api/v1/team/create', teamData);
            set({
                teams: [...get().teams, response.data],
                loading: false
            });
            return response.data;
        } catch (e) {
            console.error('Error creating team:', e);
            set({ error:  e.message || "Failed to create team", loading: false });
            throw e;
        }
    },

    addUserToTeam: async (teamId, userId) => {
        set({ loading: true, error: null });
        try {
            await apiClient.post('/api/v1/team/add-user', { teamId, userId });
            // Odśwież wszystkie teamy
            const response = await apiClient.get('/api/v1/team/all');
            set({ teams: response. data, loading: false });
        } catch (e) {
            console. error('Error adding user to team:', e);
            set({ error:  e.message || "Failed to add user to team", loading: false });
            throw e;
        }
    },

    removeUserFromTeam: async (teamId, userId) => {
        set({ loading: true, error:  null });
        try {
            await apiClient.post('/api/v1/team/remove-user', { teamId, userId });
            // Odśwież wszystkie teamy
            const response = await apiClient.get('/api/v1/team/all');
            set({ teams: response.data, loading: false });
        } catch (e) {
            console.error('Error removing user from team:', e);
            set({ error: e.message || "Failed to remove user from team", loading: false });
            throw e;
        }
    }
}));
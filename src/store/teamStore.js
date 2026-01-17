import { create } from "zustand";
import teamApi from "@/services/teamApi";

export const useTeamStore = create((set, get) => ({
    teams: [],
    loading: false,
    error: null,
    
    fetchTeams: async () => {
        set({ loading: true, error: null });
        try {
            const data = await teamApi.getAll();
            set({ teams: data, loading: false });
        } catch (e) {
            set({ error: e.message || "Failed to fetch teams", loading: false });
        }
    },
    
    createTeam: async (teamData) => {
        set({ loading: true, error: null });
        try {
            const newTeam = await teamApi.create(teamData);
            set({ 
                teams: [...get().teams, newTeam],
                loading: false 
            });
            return newTeam;
        } catch (e) {
            set({ error: e.message || "Failed to create team", loading: false });
            throw e;
        }
    },
    
    addUserToTeam: async (teamId, userId) => {
        set({ loading: true, error: null });
        try {
            const updatedTeam = await teamApi.addUserToTeam(teamId, userId);
            set({
                teams: get().teams.map(t => t.id === teamId ? updatedTeam : t),
                loading: false
            });
            return updatedTeam;
        } catch (e) {
            set({ error: e.message || "Failed to add user to team", loading: false });
            throw e;
        }
    },
    
    removeUserFromTeam: async (teamId, userId) => {
        set({ loading: true, error: null });
        try {
            const updatedTeam = await teamApi.removeUserFromTeam(teamId, userId);
            set({
                teams: get().teams.map(t => t.id === teamId ? updatedTeam : t),
                loading: false
            });
            return updatedTeam;
        } catch (e) {
            set({ error: e.message || "Failed to remove user from team", loading: false });
            throw e;
        }
    }
}));

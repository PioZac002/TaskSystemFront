import { create } from "zustand";
import apiClient from "@/services/apiClient";

export const useTeamStore = create((set, get) => ({
    teams: [],
    loading: false,
    error: null,

    fetchTeams: async () => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.get('/api/v1/team/all');

            console.log('✅ [TeamStore] Fetched teams:', response.data);

            // Backend zwraca: TeamDto(id, name, List<int> issues, List<int> users)
            // Musimy przekształcić to do formatu z members
            const teamsWithMembers = await Promise.all(
                response. data.map(async (team) => {
                    try {
                        // Pobierz pełne dane członków dla każdego teamu
                        const membersResponse = await apiClient.get(`/api/v1/team/users/${team.id}`);

                        console.log(`✅ [TeamStore] Fetched members for team ${team.name}: `, membersResponse.data);

                        return {
                            ...team,
                            members: membersResponse. data || []  // UserDto[]
                        };
                    } catch (error) {
                        console.error(`❌ [TeamStore] Failed to fetch members for team ${team. id}:`, error);
                        return {
                            ...team,
                            members: []
                        };
                    }
                })
            );

            set({ teams: teamsWithMembers, loading: false });
        } catch (e) {
            console.error('❌ [TeamStore] fetchTeams error:', e);
            set({ error: e.message || "Failed to fetch teams", loading: false });
        }
    },

    createTeam: async (teamData) => {
        set({ loading: true, error: null });
        try {
            console.log('📝 [TeamStore] Creating team:', teamData);

            const response = await apiClient.post('/api/v1/team/create', teamData);

            console.log('✅ [TeamStore] Team created:', response.data);

            // Odśwież wszystkie teamy (żeby pobrać members)
            await get().fetchTeams();

            set({ loading: false });
            return response.data;
        } catch (e) {
            console. error('❌ [TeamStore] createTeam error:', e);
            set({ error: e. message || "Failed to create team", loading: false });
            throw e;
        }
    },

    addUserToTeam: async (teamId, userId) => {
        set({ loading: true, error: null });
        try {
            console.log('👤 [TeamStore] Adding user to team:', { teamId, userId });

            // Backend endpoint: PUT /api/v1/team/{teamId}/add-user/{userId}
            await apiClient.put(`/api/v1/team/${teamId}/add-user/${userId}`);

            console.log('✅ [TeamStore] User added to team');

            // Odśwież wszystkie teamy
            await get().fetchTeams();

            set({ loading: false });
        } catch (e) {
            console.error('❌ [TeamStore] addUserToTeam error:', e);
            set({ error: e.message || "Failed to add user to team", loading:  false });
            throw e;
        }
    },

    removeUserFromTeam: async (teamId, userId) => {
        set({ loading: true, error: null });
        try {
            console.log('👤 [TeamStore] Removing user from team:', { teamId, userId });

            // Backend endpoint: PUT /api/v1/team/{teamId}/remove-user/{userId}
            await apiClient.put(`/api/v1/team/${teamId}/remove-user/${userId}`);

            console.log('✅ [TeamStore] User removed from team');

            // Odśwież wszystkie teamy
            await get().fetchTeams();

            set({ loading: false });
        } catch (e) {
            console.error('❌ [TeamStore] removeUserFromTeam error:', e);
            set({ error: e.message || "Failed to remove user from team", loading: false });
            throw e;
        }
    }
}));
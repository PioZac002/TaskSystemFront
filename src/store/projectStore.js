import { create } from "zustand";
import { fetchProjects, createProject } from "@/services/projectApi";

export const useProjectStore = create((set) => ({
    projects: [],
    loading: false,
    error: null,
    getProjects: async () => {
        set({ loading: true, error: null });
        try {
            const data = await fetchProjects();
            set({ projects: data, loading: false });
        } catch (e) {
            set({ error: e.message, loading: false });
        }
    },
    addProject: async (project) => {
        set({ loading: true, error: null });
        try {
            const newProject = await createProject(project);
            set((state) => ({
                projects: [...state.projects, newProject],
                loading: false
            }));
        } catch (e) {
            set({ error: e.message, loading: false });
        }
    }
}));

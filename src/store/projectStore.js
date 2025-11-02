import { create } from "zustand";

const defaultProjects = [
    {
        id: "1",
        name: "Website Redesign",
        description: "Complete overhaul of company website",
        status: "active",
        progress: 65,
        team: ["JD", "SM", "AK"],
        createdAt: "2024-01-15",
        dueDate: "2024-03-30",
    },
    {
        id: "2",
        name: "Mobile App Development",
        description: "Native mobile application for iOS and Android",
        status: "active",
        progress: 40,
        team: ["MT", "RB", "LK"],
        createdAt: "2024-02-01",
        dueDate: "2024-05-15",
    },
    {
        id: "3",
        name: "API Integration",
        description: "Third-party API integrations",
        status: "completed",
        progress: 100,
        team: ["SM", "LK"],
        createdAt: "2024-01-01",
        dueDate: "2024-02-28",
    },
];

export const useProjectStore = create((set) => ({
    projects: defaultProjects,
    addProject: (project) =>
        set((state) => ({
            projects: [
                ...state.projects,
                {
                    ...project,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                },
            ],
        })),
    updateProject: (id, data) =>
        set((state) => ({
            projects: state.projects.map((p) =>
                p.id === id ? { ...p, ...data } : p
            ),
        })),
    deleteProject: (id) =>
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
        })),
}));

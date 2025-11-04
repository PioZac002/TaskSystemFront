import { create } from "zustand";
import issueApi from "@/services/issueApi"; // ten plik tworzysz wg wcześniejszego wzoru

export const useIssueStore = create((set, get) => ({
    issues: [],
    loading: false,
    error: null,

    // Pobiera wszystkie issue z backendu
    fetchIssues: async () => {
        set({ loading: true, error: null });
        try {
            const data = await issueApi.getAll();
            set({ issues: data, loading: false });
        } catch (e) {
            set({ error: "Failed to fetch issues", loading: false });
        }
    },

    // Dodaje issue do backendu i lokalnie odświeża listę
    addIssue: async (issue) => {
        set({ loading: true, error: null });
        try {
            // Ustal priorytety i status zgodnie z backendem!
            const backendIssue = {
                ...issue,
                priority: (issue.priority || "medium").toUpperCase(), // backend: "LOW", "MEDIUM", "HIGH"
                status: issue.status ? issue.status.toUpperCase() : "NEW",
                authorId: 0, // wstaw tak, by pobierać ID użytkownika zalogowanego!
                assigneeId: issue.assigneeId || 0, // opcjonalnie
            };
            await issueApi.create(backendIssue);
            await get().fetchIssues();
        } catch (e) {
            set({ error: "Failed to add issue", loading: false });
        } finally {
            set({ loading: false });
        }
    },

    // Update, delete, move -- do uzupełnienia w przyszłości
    updateIssue: async (id, data) => {},
    deleteIssue: async (id) => {},
    moveIssue: async (id, status) => {},
}));

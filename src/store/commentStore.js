import { create } from "zustand";
import apiClient from "@/services/apiClient";

export const useCommentStore = create((set, get) => ({
    comments: [],
    loading: false,
    error:  null,

    fetchCommentsByIssueId: async (issueId) => {
        set({ loading:  true, error: null });
        try {
            const response = await apiClient.get(`/api/v1/comment/issue/${issueId}`);
            set({ comments: response. data, loading: false });
        } catch (e) {
            console.error('Error fetching comments:', e);
            set({ error: e.message || "Failed to fetch comments", loading:  false, comments: [] });
        }
    },

    createComment: async (commentData) => {
        set({ loading: true, error: null });
        try {
            const response = await apiClient.post('/api/v1/comment/create', commentData);
            set({
                comments: [...get().comments, response.data],
                loading: false
            });
            return response. data;
        } catch (e) {
            console.error('Error creating comment:', e);
            set({ error: e.message || "Failed to create comment", loading:  false });
            throw e;
        }
    },

    deleteComment: async (id) => {
        set({ loading: true, error: null });
        try {
            await apiClient.delete(`/api/v1/comment/${id}`);
            set({
                comments: get().comments.filter(c => c.id !== id),
                loading: false
            });
        } catch (e) {
            console.error('Error deleting comment:', e);
            set({ error: e.message || "Failed to delete comment", loading:  false });
            throw e;
        }
    }
}));
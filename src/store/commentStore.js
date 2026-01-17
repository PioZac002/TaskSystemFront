import { create } from "zustand";
import commentApi from "@/services/commentApi";

export const useCommentStore = create((set, get) => ({
    comments: [],
    loading: false,
    error: null,
    
    fetchCommentsByIssueId: async (issueId) => {
        set({ loading: true, error: null });
        try {
            const data = await commentApi.getByIssueId(issueId);
            set({ comments: data, loading: false });
        } catch (e) {
            set({ error: e.message || "Failed to fetch comments", loading: false });
        }
    },
    
    createComment: async (commentData) => {
        set({ loading: true, error: null });
        try {
            const newComment = await commentApi.create(commentData);
            set({ 
                comments: [...get().comments, newComment],
                loading: false 
            });
            return newComment;
        } catch (e) {
            set({ error: e.message || "Failed to create comment", loading: false });
            throw e;
        }
    },
    
    deleteComment: async (id) => {
        set({ loading: true, error: null });
        try {
            await commentApi.deleteComment(id);
            set({ 
                comments: get().comments.filter(c => c.id !== id),
                loading: false 
            });
        } catch (e) {
            set({ error: e.message || "Failed to delete comment", loading: false });
            throw e;
        }
    }
}));

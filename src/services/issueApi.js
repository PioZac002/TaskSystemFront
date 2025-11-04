// src/services/issueApi.js
import apiClient from "./apiClient";

export const issueApi = {
    // Pobranie wszystkich issue
    async getAll() {
        const res = await apiClient.get("/api/v1/issue/all");
        return res.data;
    },

    // Pobranie issue po id
    async getById(id) {
        const res = await apiClient.get(`/api/v1/issue/id/${id}`);
        return res.data;
    },

    // Pobranie issue po kluczu
    async getByKey(key) {
        const res = await apiClient.get(`/api/v1/issue/key/${key}`);
        return res.data;
    },

    // Pobranie issue dla projektu
    async getByProject(projectId) {
        const res = await apiClient.get(`/api/v1/issue/project/${projectId}`);
        return res.data;
    },

    // Dodanie nowego issue
    async create(issueData) {
        const res = await apiClient.post("/api/v1/issue/create", issueData);
        return res.data;
    },


};

export default issueApi;

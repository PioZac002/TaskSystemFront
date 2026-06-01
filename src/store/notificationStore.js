import { create } from "zustand";
import * as signalR from "@microsoft/signalr";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/apiClient";
import { notificationApi } from "@/services/notificationApi";
import { storageService } from "@/services/storageService";

const HUB_METHODS = [
    "ReceiveNotification",
    "Notification",
    "notification",
    "SendNotification",
    "ReceiveMessage",
];

let connection = null;
let startingPromise = null;

function normalizeNotification(notification) {
    if (!notification || typeof notification !== "object") return null;

    return {
        id: notification.id,
        userId: notification.userId,
        eventAuthorId: notification.eventAuthorId,
        issueId: notification.issueId,
        key: notification.key,
        type: notification.type || "NOTIFICATION",
        isRead: Boolean(notification.isRead),
        createdAt: notification.createdAt || new Date().toISOString(),
        properties: notification.properties || {},
    };
}

function unpackNotifications(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload.map(normalizeNotification).filter(Boolean);
    if (Array.isArray(payload.items)) return payload.items.map(normalizeNotification).filter(Boolean);
    if (payload.item) return unpackNotifications(payload.item);
    if (payload.notification) return unpackNotifications(payload.notification);
    return [normalizeNotification(payload)].filter(Boolean);
}

function mergeNotifications(current, incoming) {
    const byId = new Map();

    for (const item of [...incoming, ...current]) {
        const key = item.id ?? `${item.type}-${item.issueId}-${item.createdAt}`;
        if (!byId.has(key)) byId.set(key, item);
    }

    return Array.from(byId.values())
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 20);
}

function notificationTitle(notification) {
    const type = String(notification.type || "notification").replaceAll("_", " ").toLowerCase();
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    return notification.key ? `${label}: ${notification.key}` : label;
}

function buildHubUrl(token) {
    const url = new URL("/notificationHub", API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`);
    url.searchParams.set("access_token", token);
    return url.toString();
}

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    totalCount: 0,
    loading: false,
    error: null,
    connected: false,

    unreadCount: () => get().notifications.filter((item) => !item.isRead).length,

    fetchNotifications: async ({ qty = 10, unread = true } = {}) => {
        const token = storageService.getItem("accessToken");
        if (!token) return;

        set({ loading: true, error: null });
        try {
            const response = await notificationApi.fetchMine({ qty, unread });
            const items = unpackNotifications(response);
            set({
                notifications: mergeNotifications([], items),
                totalCount: response?.totalCount ?? items.length,
                loading: false,
            });
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.Message || error.message || "Failed to load notifications",
            });
        }
    },

    addNotifications: (payload, { showToast = true } = {}) => {
        const incoming = unpackNotifications(payload);
        if (incoming.length === 0) return;

        set((state) => ({
            notifications: mergeNotifications(state.notifications, incoming),
            totalCount: Math.max(state.totalCount, state.notifications.length + incoming.length),
        }));

        if (showToast) {
            toast.info(notificationTitle(incoming[0]));
        }
    },

    markAsRead: async (id) => {
        if (!id) return;

        const previous = get().notifications;
        set((state) => ({
            notifications: state.notifications.filter((item) => item.id !== id),
        }));

        try {
            await notificationApi.markAsRead(id);
        } catch (error) {
            set({ notifications: previous });
            toast.error(error.response?.data?.Message || error.message || "Failed to mark notification as read");
        }
    },

    connectRealtime: async () => {
        const token = storageService.getItem("accessToken");
        if (!token) return;

        if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
            return startingPromise;
        }

        connection = new signalR.HubConnectionBuilder()
            .withUrl(buildHubUrl(token))
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        const handleIncoming = (...args) => {
            get().addNotifications(args.length > 1 ? args : args[0]);
        };

        HUB_METHODS.forEach((method) => connection.on(method, handleIncoming));

        connection.onreconnecting(() => set({ connected: false }));
        connection.onreconnected(() => {
            set({ connected: true });
            get().fetchNotifications({ qty: 10, unread: true });
        });
        connection.onclose(() => set({ connected: false }));

        startingPromise = connection
            .start()
            .then(() => set({ connected: true, error: null }))
            .catch((error) => {
                set({
                    connected: false,
                    error: error.message || "Failed to connect notification hub",
                });
            })
            .finally(() => {
                startingPromise = null;
            });

        return startingPromise;
    },

    disconnectRealtime: async () => {
        if (!connection) {
            set({ connected: false });
            return;
        }

        const current = connection;
        connection = null;
        startingPromise = null;

        try {
            await current.stop();
        } finally {
            set({ connected: false });
        }
    },
}));

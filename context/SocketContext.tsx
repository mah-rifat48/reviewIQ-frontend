"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { decodeToken } from "@/lib/utils";
import toast from "react-hot-toast";

export interface Notification {
    id: string;
    type: "info" | "success" | "alert" | "warning" | "report";
    title: string;
    message: string;
    time: string; // ISO string
    unread: boolean;
    category: "Alerts" | "Reports" | "Info";
}

interface SocketContextType {
    socket: Socket | null;
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllRead: () => void;
    clearAll: () => void;
    removeNotification: (id: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Dynamic notification addition helper
    const addNotification = (newNotif: Notification, uId: string) => {
        if (!uId) return;
        setNotifications((prev) => {
            const updated = [newNotif, ...prev];
            localStorage.setItem(`notifications_${uId}`, JSON.stringify(updated));
            return updated;
        });
    };

    // Periodically sync the token to handle login/logout/role switches reactively
    useEffect(() => {
        const checkToken = () => {
            const token = Cookies.get("accessToken");
            if (!token) {
                setUserId(null);
                if (socket) {
                    socket.disconnect();
                    setSocket(null);
                }
                return;
            }

            const decoded = decodeToken(token);
            const currentUserId = decoded?.sub || decoded?.userId;
            
            if (currentUserId && currentUserId !== userId) {
                setUserId(currentUserId);
            }
        };

        checkToken();
        const interval = setInterval(checkToken, 2000);
        return () => clearInterval(interval);
    }, [userId, socket]);

    // Load persisted notifications once userId is set
    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            return;
        }

        const stored = localStorage.getItem(`notifications_${userId}`);
        if (stored) {
            try {
                setNotifications(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse notifications from localStorage", e);
            }
        } else {
            setNotifications([]);
        }
    }, [userId]);

    // Setup Socket connection when token / userId is active
    useEffect(() => {
        const token = Cookies.get("accessToken");
        if (!token || !userId) return;

        const socketUrl = process.env.NEXT_PUBLIC_BASE_URL?.split("/api/v1")[0] || "http://localhost:3000";

        const newSocket = io(socketUrl, {
            auth: {
                token: token,
            },
            transports: ["websocket", "polling"],
        });

        newSocket.on("connect", () => {
            console.log("WebSocket connected:", newSocket.id);
        });

        // 1. Subscription Created Event
        newSocket.on("subscriptionCreated", (data) => {
            const newNotif: Notification = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                type: "success",
                title: "Subscription Created",
                message: data.message || `Your ${data.plan || ""} subscription has been created.`,
                time: new Date().toISOString(),
                unread: true,
                category: "Info",
            };
            addNotification(newNotif, userId);
            toast.success(newNotif.message);
        });

        // 2. Payment Success Event
        newSocket.on("paymentSuccess", (data) => {
            const newNotif: Notification = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                type: "success",
                title: "Payment Successful",
                message: data.message || `Payment successful for ${data.plan} plan.`,
                time: new Date().toISOString(),
                unread: true,
                category: "Info",
            };
            addNotification(newNotif, userId);
            toast.success(newNotif.message);
        });

        // 3. Rating Drop Alert Event
        newSocket.on("ratingDropAlert", (data) => {
            const newNotif: Notification = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                type: "alert",
                title: "Rating Drop Detected",
                message: data.message,
                time: new Date().toISOString(),
                unread: true,
                category: "Alerts",
            };
            addNotification(newNotif, userId);
            toast.error(newNotif.message);
        });

        // 4. Analysis Report Event
        newSocket.on("analysisReport", (data) => {
            const newNotif: Notification = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                type: "report",
                title: "Analysis Report Ready",
                message: data.message,
                time: new Date().toISOString(),
                unread: true,
                category: "Reports",
            };
            addNotification(newNotif, userId);
            toast.success(newNotif.message);
        });

        // 5. Admin Notification Event
        newSocket.on("adminNotification", (data) => {
            const newNotif: Notification = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                type: data.type === "PAYMENT" ? "success" : "info",
                title: data.title || "Admin Alert",
                message: data.message,
                time: new Date().toISOString(),
                unread: true,
                category: "Info",
            };
            addNotification(newNotif, userId);
            toast.success(`[Admin] ${newNotif.message}`);
        });

        newSocket.on("disconnect", () => {
            console.log("WebSocket disconnected");
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    const markAsRead = (id: string) => {
        if (!userId) return;
        setNotifications((prev) => {
            const updated = prev.map((n) => (n.id === id ? { ...n, unread: false } : n));
            localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
            return updated;
        });
    };

    const markAllRead = () => {
        if (!userId) return;
        setNotifications((prev) => {
            const updated = prev.map((n) => ({ ...n, unread: false }));
            localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
            return updated;
        });
    };

    const clearAll = () => {
        if (!userId) return;
        setNotifications([]);
        localStorage.removeItem(`notifications_${userId}`);
    };

    const removeNotification = (id: string) => {
        if (!userId) return;
        setNotifications((prev) => {
            const updated = prev.filter((n) => n.id !== id);
            localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
            return updated;
        });
    };

    const unreadCount = notifications.filter((n) => n.unread).length;

    return (
        <SocketContext.Provider
            value={{
                socket,
                notifications,
                unreadCount,
                markAsRead,
                markAllRead,
                clearAll,
                removeNotification,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}

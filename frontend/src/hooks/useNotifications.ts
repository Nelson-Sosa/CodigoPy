import { useState, useEffect, useCallback } from "react";
import { Notification } from "../components/notifications/NotificationPanel";

const STORAGE_KEY = "codigopy_notifications";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Cargar notificaciones del localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      } catch (e) {
        console.error("Error parsing notifications:", e);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "dismissed">) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dismissed: false,
      timestamp: new Date(),
    };

    setNotifications(prev => {
      // Evitar duplicados del mismo tipo
      const exists = prev.some(n => 
        n.type === notification.type && 
        !n.dismissed &&
        n.userId === newNotification.userId // <-- NUEVO: filtrar por userId
      );
      if (exists) return prev;
      return [newNotification, ...prev].slice(0, 10); // Max 10 notificaciones
    });

    return newNotification;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addStockAlert = useCallback((productName: string, currentStock: number, minStock: number) => {
    return addNotification({
      type: "stock",
      title: "⚠️ Stock Bajo",
      message: `${productName}: Stock actual ${currentStock} (mínimo: ${minStock})`,
    });
  }, [addNotification]);

  const addSalesTargetAlert = useCallback((currentPercent: number, targetAmount: number) => {
    // Solo notificar a vendedores, no a admin
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') return; // No notificar a admin
      } catch {}
    }
    
    const user = userStr ? JSON.parse(userStr) : null;
    
    return addNotification({
      type: "sales",
      title: "🎯 Meta de Ventas",
      message: `Has alcanzado el ${currentPercent.toFixed(0)}% de tu meta mensual ($${targetAmount})`,
      userId: user?.id || user?._id || "", // <-- NUEVO: asociar al usuario
    });
  }, [addNotification]);

  const addSuccessNotification = useCallback((message: string) => {
    return addNotification({
      type: "success",
      title: "✅ Éxito",
      message,
    });
  }, [addNotification]);

  const activeCount = notifications.filter(n => !n.dismissed).length;

  return {
    notifications,
    activeCount,
    addNotification,
    dismissNotification,
    clearAll,
    addStockAlert,
    addSalesTargetAlert,
    addSuccessNotification,
  };
};

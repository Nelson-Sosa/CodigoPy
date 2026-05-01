import { useState, useEffect } from "react";
import { Bell, X, AlertTriangle, TrendingUp, Package, CheckCircle } from "lucide-react";

export interface Notification {
  id: string;
  type: "stock" | "sales" | "success";
  title: string;
  message: string;
  timestamp?: Date;
  dismissed?: boolean;
  targetRoles?: ("admin" | "vendedor")[]; // <-- NUEVO: para qué roles es esta notificación
}

interface NotificationPanelProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onViewAll?: () => void;
}

const NotificationPanel = ({ notifications, onDismiss, onViewAll }: NotificationPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeNotifications = notifications.filter(n => {
    if (n.dismissed) return false;
    
    // Filtrar notificaciones de "sales" por userId
    if (n.type === 'sales' && n.userId) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return n.userId === (user.id || user._id);
        } catch { return false; }
      }
      return false;
    }
    
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "stock":
        return <AlertTriangle size={20} className="text-red-500" />;
      case "sales":
        return <TrendingUp size={20} className="text-yellow-500" />;
      case "success":
        return <CheckCircle size={20} className="text-green-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case "stock":
        return "bg-red-50 border-red-200 hover:bg-red-100";
      case "sales":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
      case "success":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="relative">
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell size={24} className="text-gray-600" />
        {activeNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {activeNotifications.length}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Bell size={16} />
                Notificaciones
              </h3>
              {onViewAll && (
                <button 
                  onClick={onViewAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Ver todas
                </button>
              )}
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-96 overflow-y-auto">
              {activeNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay notificaciones</p>
                </div>
              ) : (
                activeNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b last:border-b-0 transition-colors ${getStyles(notification.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      <button
                        onClick={() => onDismiss(notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPanel;
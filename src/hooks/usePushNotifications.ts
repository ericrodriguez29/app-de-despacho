import { useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types/dispatch';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('dispatch_app_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'notif-1',
        title: '🚚 Ruta Norte Iniciada',
        message: 'El transportista Juan Pérez inició ruta con 45 unidades a despachar.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        type: 'info',
        read: false,
      },
      {
        id: 'notif-2',
        title: '📦 Entrega Concluida',
        message: 'Pedido DSP-1005 entregado satisfactoriamente (5 unidades recibidas conformes).',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        type: 'success',
        read: false,
      }
    ];
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dispatch_app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Audio tone generation for dispatch alerts
  const playDispatchSound = useCallback((type: 'success' | 'alert' | 'info' = 'info') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // AudioContext might be restricted until user gesture
    }
  }, []);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // Ignore haptic error
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        sendNotification(
          '🔔 Notificaciones Push Activadas',
          'Recibirás alertas en tiempo real sobre salidas, llegadas, entregas de unidades y retrasos.',
          'success'
        );
      }
      return result;
    } catch {
      return 'denied';
    }
  };

  const sendNotification = useCallback(
    (
      title: string,
      message: string,
      type: 'info' | 'success' | 'warning' | 'alert' = 'info',
      meta?: { orderId?: string; routeId?: string }
    ) => {
      const timeStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        message,
        timestamp: timeStr,
        type,
        read: false,
        orderId: meta?.orderId,
        routeId: meta?.routeId,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
      playDispatchSound(type === 'alert' ? 'alert' : type === 'success' ? 'success' : 'info');
      triggerHaptic();

      // Native Browser Push Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification(title, {
                body: message,
                icon: '/pwa-192x192.png',
                badge: '/icon.svg',
                tag: meta?.orderId || 'dispatch-update',
              });
            });
          } else {
            new Notification(title, {
              body: message,
              icon: '/pwa-192x192.png',
            });
          }
        } catch {
          // Fallback handled by in-app toast/feed
        }
      }

      return newNotif;
    },
    [playDispatchSound, triggerHaptic]
  );

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    permission,
    notifications,
    unreadCount,
    requestPermission,
    sendNotification,
    markAllAsRead,
    clearNotifications,
    playDispatchSound,
    triggerHaptic,
  };
}

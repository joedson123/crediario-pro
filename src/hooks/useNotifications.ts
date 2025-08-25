import { useState, useEffect } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Notificações não são suportadas neste navegador');
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const showNotification = async (options: NotificationOptions): Promise<Notification | null> => {
    if (!isSupported) {
      console.warn('Notificações não são suportadas');
      return null;
    }

    if (permission !== 'granted') {
      const newPermission = await requestPermission();
      if (newPermission !== 'granted') {
        console.warn('Permissão de notificação negada');
        return null;
      }
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      badge: options.badge || '/icon-192.png',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      actions: options.actions || []
    });

    return notification;
  };

  // Notification templates for common scenarios
  const notifyPaymentDue = (clientName: string, amount: number) => {
    return showNotification({
      title: 'Cobrança Vencendo',
      body: `${clientName} - ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      tag: 'payment-due',
      requireInteraction: true,
      actions: [
        {
          action: 'call',
          title: 'Ligar',
          icon: '/icons/phone.png'
        },
        {
          action: 'navigate',
          title: 'Navegar',
          icon: '/icons/map.png'
        }
      ]
    });
  };

  const notifyPaymentReceived = (clientName: string, amount: number) => {
    return showNotification({
      title: 'Pagamento Recebido! 🎉',
      body: `${clientName} pagou ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      tag: 'payment-received'
    });
  };

  const notifyDailyGoal = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    
    if (percentage >= 100) {
      return showNotification({
        title: 'Meta Diária Atingida! 🎯',
        body: `Parabéns! Você coletou ${current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        tag: 'daily-goal-achieved'
      });
    } else if (percentage >= 75) {
      return showNotification({
        title: 'Quase lá! 💪',
        body: `Você já coletou ${percentage.toFixed(0)}% da sua meta diária`,
        tag: 'daily-goal-progress'
      });
    }
  };

  const notifyRouteOptimization = (clientsCount: number, distance: number) => {
    return showNotification({
      title: 'Rota Otimizada Disponível',
      body: `${clientsCount} clientes em ${distance.toFixed(1)}km - Economize tempo!`,
      tag: 'route-optimization',
      actions: [
        {
          action: 'view-route',
          title: 'Ver Rota',
          icon: '/icons/route.png'
        }
      ]
    });
  };

  const notifyOfflineSync = (pendingItems: number) => {
    return showNotification({
      title: 'Dados Sincronizados',
      body: `${pendingItems} item${pendingItems > 1 ? 's' : ''} sincronizado${pendingItems > 1 ? 's' : ''} com sucesso`,
      tag: 'offline-sync'
    });
  };

  const scheduleReminder = (clientName: string, time: Date) => {
    const now = new Date();
    const delay = time.getTime() - now.getTime();
    
    if (delay > 0) {
      setTimeout(() => {
        showNotification({
          title: 'Lembrete de Visita',
          body: `Hora de visitar ${clientName}`,
          tag: `reminder-${clientName}`,
          requireInteraction: true,
          actions: [
            {
              action: 'navigate',
              title: 'Navegar',
              icon: '/icons/map.png'
            },
            {
              action: 'postpone',
              title: 'Adiar',
              icon: '/icons/clock.png'
            }
          ]
        });
      }, delay);
    }
  };

  // Service Worker registration for background notifications
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);
        return registration;
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
        return null;
      }
    }
    return null;
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    notifyPaymentDue,
    notifyPaymentReceived,
    notifyDailyGoal,
    notifyRouteOptimization,
    notifyOfflineSync,
    scheduleReminder,
    registerServiceWorker
  };
};
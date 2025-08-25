import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Users, Plus, Phone, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { cn } from '@/lib/utils';

interface MobileQuickActionsProps {
  className?: string;
}

const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline, pendingSync } = useOfflineStorage();

  // Don't show on certain pages where it might interfere
  const hiddenPaths = ['/novo-cliente', '/camera'];
  if (hiddenPaths.some(path => location.pathname.includes(path))) {
    return null;
  }

  const quickActions = [
    {
      icon: MapPin,
      label: 'Mapa',
      path: '/mapa-clientes',
      color: 'bg-blue-500 hover:bg-blue-600',
      isActive: location.pathname === '/mapa-clientes'
    },
    {
      icon: Users,
      label: 'Clientes',
      path: '/clientes',
      color: 'bg-green-500 hover:bg-green-600',
      isActive: location.pathname === '/clientes'
    },
    {
      icon: Plus,
      label: 'Novo',
      path: '/novo-cliente',
      color: 'bg-purple-500 hover:bg-purple-600',
      isActive: location.pathname === '/novo-cliente'
    },
    {
      icon: CheckCircle,
      label: 'Dashboard',
      path: '/dashboard',
      color: 'bg-orange-500 hover:bg-orange-600',
      isActive: location.pathname === '/dashboard'
    }
  ];

  return (
    <div className={cn(
      "mobile-quick-actions md:hidden",
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50",
      "shadow-lg backdrop-blur-sm bg-white/95",
      className
    )}>
      {/* Offline/Sync Status */}
      {(!isOnline || pendingSync > 0) && (
        <div className="mb-2 px-2">
          <div className={cn(
            "flex items-center justify-center gap-2 py-1 px-3 rounded-full text-xs font-medium",
            !isOnline ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              !isOnline ? "bg-orange-500" : "bg-blue-500"
            )} />
            {!isOnline ? 'Offline' : `${pendingSync} pendente${pendingSync > 1 ? 's' : ''}`}
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="flex gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.path}
              onClick={() => navigate(action.path)}
              variant={action.isActive ? "default" : "outline"}
              className={cn(
                "quick-action-btn flex-1 flex flex-col items-center gap-1 h-auto py-3 px-2",
                "min-h-[60px] text-xs font-medium",
                action.isActive && action.color,
                !action.isActive && "border-gray-200 text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{action.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Emergency Actions */}
      <div className="flex gap-2 mt-2">
        <Button
          onClick={() => window.open('tel:190', '_self')}
          variant="outline"
          size="sm"
          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
        >
          <Phone className="h-4 w-4 mr-1" />
          Emergência
        </Button>
        
        <Button
          onClick={() => {
            // Quick call to most recent client or support
            window.open('tel:', '_self');
          }}
          variant="outline"
          size="sm"
          className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
        >
          <Phone className="h-4 w-4 mr-1" />
          Suporte
        </Button>
      </div>

      {/* Safe area for devices with home indicator */}
      <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  );
};

export default MobileQuickActions;
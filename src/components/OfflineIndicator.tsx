import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, offlineQueueCount } = useDispatch();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow-2xl shadow-amber-950/60 border border-amber-400/40 animate-pulse">
      <WifiOff className="w-4 h-4 text-amber-200" />
      <div className="flex flex-col">
        <span>Modo Sin Conexión (Offline Activo)</span>
        <span className="text-[10px] text-amber-200 font-normal">
          Todos los cambios y entregas se guardan localmente en tu dispositivo.
        </span>
      </div>
      {offlineQueueCount > 0 && (
        <span className="ml-1 px-2 py-0.5 bg-black/30 rounded-full text-[10px] font-mono flex items-center gap-1">
          <Database className="w-3 h-3" /> {offlineQueueCount} cambios
        </span>
      )}
    </div>
  );
};

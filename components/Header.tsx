'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import NotificationDrawer from './NotificationDrawer';

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between bg-gray-900 px-6 py-4 text-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSheetOpen(true)}
            className="text-white hover:bg-gray-800"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <NotificationDrawer
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
      />
    </>
  );
}

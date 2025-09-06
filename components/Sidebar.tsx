// components/Sidebar.tsx
'use client';

import { motion } from 'framer-motion';
import { Calendar, FolderOpen, ListTodo, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface PartialProfile {
  role: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface SidebarProps {
  isCollapsed: boolean;
  profile: PartialProfile | null;
}

export default function Sidebar({ isCollapsed, profile }: SidebarProps) {
  const pathname = usePathname();

    const baseMenuItems = [
    {
      icon: ListTodo,
      label: 'My Tasks',
      href: '/dashboard',
    },
    {
      icon: FolderOpen,
      label: 'Team Projects',
      href: '/projects',
    },
    {
      icon: Calendar,
      label: 'Calendar',
      href: '/calendar',
    },
  ];

  // Add Users menu item only for superusers
  const menuItems =
    profile?.role === 'superuser'
      ? [
          ...baseMenuItems,
          {
            icon: Users,
            label: 'Users',
            href: '/dashboard/users',
          },
        ]
      : baseMenuItems;

  const isSuperuser = profile?.role === 'superuser';

  return (
    <div
      className={`${isSuperuser ? 'bg-slate-800' : 'bg-white'} border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } h-full`}
    >
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link key={index} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={`w-full justify-start ${
                        isCollapsed ? 'px-2' : 'px-3'
                      } ${
                        isActive
                          ? 'shadow-soft bg-green-500 text-white hover:bg-green-600'
                          : isSuperuser
                            ? 'text-gray-300 hover:bg-slate-700 hover:text-white'
                            : ''
                      } transition-all`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'} ${
                          isSuperuser && !isActive ? 'text-gray-300' : ''
                        }`}
                      />
                      {!isCollapsed && (
                        <span
                          className={
                            isSuperuser && !isActive ? 'text-gray-300' : ''
                          }
                        >
                          {item.label}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

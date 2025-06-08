'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Video, 
  Home, 
  Plus, 
  LayoutDashboard, 
  User, 
  Menu, 
  X,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, setShowAuthModal } = useStore();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/create', label: 'Create', icon: Plus },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">ReddiToks</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive(item.href)
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-300 hover:text-green-400 hover:bg-green-500/5"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-green-400"
              >
                <User className="h-4 w-4 mr-2" />
                {user.name || user.email}
              </Button>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-green-400"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            <Link href="/create">
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-gray-800"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
                    isActive(item.href)
                      ? "text-green-400 bg-green-500/10"
                      : "text-gray-300 hover:text-green-400 hover:bg-green-500/5"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-800">
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-green-400"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.name || user.email}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsOpen(false);
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-green-400"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  BarChart3,
} from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface LayoutProps {
  children: ReactNode
  userRole?: string
}

export function Layout({ children, userRole }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tickets', label: 'Tickets', icon: Ticket },
    ...(userRole === 'ADMIN' || userRole === 'AGENT'
      ? [
          { href: '/command-center', label: 'Command Center', icon: BarChart3 },
          { href: '/agent', label: 'Agent View', icon: BarChart3 },
        ]
      : []),
    ...(userRole === 'ADMIN'
      ? [{ href: '/admin', label: 'Admin', icon: Settings }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen overflow-hidden">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg lg:hidden"
            >
              <SidebarContent
                navItems={navItems}
                pathname={pathname}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden lg:flex lg:flex-shrink-0">
          <motion.div
            animate={{ width: sidebarCollapsed ? '5rem' : '16rem' }}
            className="flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
          >
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <SidebarContent
                navItems={navItems}
                pathname={pathname}
                onLogout={handleLogout}
                theme={theme}
                toggleTheme={toggleTheme}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-soft">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Ticketing System
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

function SidebarContent({
  navItems,
  pathname,
  onClose,
  onLogout,
  theme,
  toggleTheme,
  collapsed,
  onToggleCollapse,
}: {
  navItems: Array<{ href: string; label: string; icon: any }>
  pathname: string
  onClose?: () => void
  onLogout: () => void
  theme: string
  toggleTheme: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  return (
    <>
      <div className={`flex items-center flex-shrink-0 px-4 mb-8 ${collapsed ? 'justify-center' : ''}`}>
        <Ticket className="w-8 h-8 text-primary" />
        {!collapsed && (
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
            Ticketing
          </span>
        )}
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-2xl transition-colors ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
      <div className={`px-2 space-y-1 border-t border-gray-200 dark:border-gray-700 pt-4 ${collapsed ? 'px-1' : ''}`}>
        <button
          onClick={toggleTheme}
          className={`flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5 h-5" />
              {!collapsed && <span className="ml-3">Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              {!collapsed && <span className="ml-3">Dark Mode</span>}
            </>
          )}
        </button>
        <button
          onClick={onLogout}
          className={`flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900 transition-colors ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </>
  )
}


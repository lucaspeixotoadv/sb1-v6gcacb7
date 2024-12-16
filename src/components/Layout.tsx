import React from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Users, Bot, MessageSquare, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm relative z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">WhatsApp CRM</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex relative" style={{ '--sidebar-width': '47px' } as React.CSSProperties}>
        {/* Sidebar */}
        <aside
          style={{ width: 'var(--sidebar-width)' }}
          className={`fixed top-0 left-0 h-full bg-white border-r shadow-sm z-50 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out`}
        >
          <nav className="flex flex-col gap-1 p-2 pt-14">
            <Link
              to="/dashboard"
              className="p-2.5 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="Dashboard"
            >
              <Users className="w-5 h-5" />
            </Link>
            <Link
              to="/automation"
              className="p-2.5 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="Automação"
            >
              <Bot className="w-5 h-5" />
            </Link>
            <Link
              to="/chat"
              className="p-2.5 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>
            <Link
              to="/settings"
              className="p-2.5 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="Configurações"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main style={{ paddingLeft: 'var(--sidebar-width)' }} className="flex-1 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
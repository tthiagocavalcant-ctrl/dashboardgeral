import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Painel' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-[220px] flex flex-col border-r border-[#1e1e2a] bg-[#0d0d15]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-5 border-b border-[#1e1e2a]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-white text-sm">AdsDash</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a24]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-4 w-4', isActive ? 'text-indigo-400' : '')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e1e2a]">
        <p className="text-xs text-gray-600">Meta Ads Monitor</p>
        <p className="text-xs text-gray-700">v1.0.0</p>
      </div>
    </aside>
  );
}

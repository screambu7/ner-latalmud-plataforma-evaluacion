import {
  HouseIcon,
  UsersIcon,
  FileIcon,
  PresentationChartIcon,
  GearIcon,
} from './navigation-icons';

interface NavigationItem {
  label: string;
  href: string;
  iconType: 'house' | 'users' | 'file' | 'presentation-chart' | 'gear';
  isActive?: boolean;
}

interface BottomNavigationProps {
  items: NavigationItem[];
}

/**
 * BottomNavigation - Navegación inferior del dashboard
 * Mantiene la estructura exacta del HTML original
 */
export function BottomNavigation({ items }: BottomNavigationProps) {
  return (
    <div>
      <div className="flex gap-2 border-t border-[color:var(--color-background-card)] bg-[color:var(--color-background-light)] px-4 pb-3 pt-2">
        {items.map((item, index) => (
          <a
            key={index}
            className={`just flex flex-1 flex-col items-center justify-end gap-1 ${
              item.isActive
                ? 'rounded-full text-[color:var(--color-text-primary)]'
                : 'text-[color:var(--color-text-tertiary)]'
            }`}
            href={item.href}
          >
            <div
              className={`flex h-8 items-center justify-center ${
                item.isActive
                  ? 'text-[color:var(--color-text-primary)]'
                  : 'text-[color:var(--color-text-tertiary)]'
              }`}
            >
              {item.iconType === 'house' && <HouseIcon />}
              {item.iconType === 'users' && <UsersIcon />}
              {item.iconType === 'file' && <FileIcon />}
              {item.iconType === 'presentation-chart' && <PresentationChartIcon />}
              {item.iconType === 'gear' && <GearIcon />}
            </div>
            <p
              className={`text-xs font-medium leading-normal tracking-[0.015em] ${
                item.isActive
                  ? 'text-[color:var(--color-text-primary)]'
                  : 'text-[color:var(--color-text-tertiary)]'
              }`}
            >
              {item.label}
            </p>
          </a>
        ))}
      </div>
      <div className="h-5 bg-[color:var(--color-background-light)]"></div>
    </div>
  );
}

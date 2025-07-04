import React from 'react';
import type { Feature } from '../App';
import {
  HomeSolidIcon, HomeOutlineIcon,
  CalendarIcon, CalendarDaysIcon,
  CheckBadgeSolidIcon, CheckBadgeOutlineIcon,
  PencilIcon, PencilSquareIcon,
  ChatBubbleBottomCenterTextSolidIcon, ChatBubbleBottomCenterTextOutlineIcon
} from './icons/Icons';

interface BottomNavBarProps {
  activeFeature: Feature;
  onNavigate: (feature: Feature) => void;
}

const NavItem: React.FC<{
  feature: Feature;
  label: string;
  iconSolid: React.ElementType;
  iconOutline: React.ElementType;
  isActive: boolean;
  onClick: (feature: Feature) => void;
}> = ({ feature, label, iconSolid: IconSolid, iconOutline: IconOutline, isActive, onClick }) => (
  <button
    onClick={() => onClick(feature)}
    className="flex flex-col items-center justify-center gap-1 pt-2 pb-1 text-center transition-colors duration-200 focus:outline-none"
    aria-current={isActive ? 'page' : undefined}
  >
    <div className={`size-7 transition-transform ${isActive ? 'scale-110 text-[var(--primary-color)]' : 'scale-100 text-[var(--text-secondary)]'}`}>
      {isActive ? <IconSolid className="size-full" /> : <IconOutline className="size-full" />}
    </div>
    <span className={`text-xs font-bold ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'}`}>
      {label}
    </span>
  </button>
);


const navItems = [
    { feature: 'home', label: 'Beranda', iconOutline: HomeOutlineIcon, iconSolid: HomeSolidIcon },
    { feature: 'schedule', label: 'Jadwal', iconOutline: CalendarDaysIcon, iconSolid: CalendarIcon },
    { feature: 'todo', label: 'Tugas', iconOutline: CheckBadgeOutlineIcon, iconSolid: CheckBadgeSolidIcon },
    { feature: 'evaluation', label: 'Evaluasi', iconOutline: PencilSquareIcon, iconSolid: PencilIcon },
    { feature: 'ai-assistant', label: 'Asisten AI', iconOutline: ChatBubbleBottomCenterTextOutlineIcon, iconSolid: ChatBubbleBottomCenterTextSolidIcon },
] as const;


export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeFeature, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--background-white)]/90 backdrop-blur-lg border-t border-[var(--border-light)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] grid grid-cols-5 md:hidden z-30">
        {navItems.map(item => (
            <NavItem 
                key={item.feature}
                {...item}
                isActive={activeFeature === item.feature}
                onClick={onNavigate}
            />
        ))}
    </nav>
  );
};

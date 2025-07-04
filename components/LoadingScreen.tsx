
import React from 'react';
import { AcademicCapIcon } from './icons/Icons';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background-loading)] text-center p-4">
      <div className="text-[var(--primary-color)] mb-6">
        <AcademicCapIcon className="w-24 h-24" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--primary-color)] leading-tight">
        Asisten Guru
        <br />
        Cerdas
      </h1>
      <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-sm">
        Mempersiapkan pengalaman terbaik untuk Anda...
      </p>
      <div className="absolute bottom-16 flex space-x-2">
        <div className="w-3 h-3 bg-[var(--primary-color)] rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-[var(--primary-color)] rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-[var(--primary-color)] rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

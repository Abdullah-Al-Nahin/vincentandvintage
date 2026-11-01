'use client';

import React from 'react';

export default function SectionHeader({ title, actionText, onAction }) {
  return (
    <div className="max-w-[1450px] mx-auto px-4 sm:px-8 mt-6 sm:mt-8 lg:mt-10 mb-4 sm:mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#e3ded3]">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-5 bg-[#a8825b] rounded-full inline-block" />
          <h2 className="uppercase text-lg sm:text-2xl font-display font-bold tracking-[0.14em] text-[#3d2b1f]">
            {title}
          </h2>
        </div>
        {actionText && (
          <button
            onClick={onAction}
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-display uppercase tracking-widest text-[#a8825b] hover:text-[#4e3828] font-bold transition-all cursor-pointer"
          >
            <span>{actionText}</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </button>
        )}
      </div>
    </div>
  );
}

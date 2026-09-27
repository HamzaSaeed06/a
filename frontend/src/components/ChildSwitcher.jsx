import React from 'react';

export default function ChildSwitcher({ selectedChildId, onSelectChild, childrenList }) {
  return (
    <div className="flex items-center gap-3 px-6 md:px-8 mb-4">
      {childrenList.map((child) => {
        const isSelected = child.id === selectedChildId;
        return (
          <button
            key={child.id}
            type="button"
            onClick={() => onSelectChild(child.id)}
            className={`flex items-center gap-3.5 px-4 py-2 rounded-2xl transition-all duration-200 text-left ${
              isSelected
                ? 'bg-white border-2 border-rose-400 shadow-sm'
                : 'bg-white/60 border border-slate-200/80 hover:bg-white hover:border-slate-300'
            }`}
          >
            <img
              src={child.avatar}
              alt={child.name}
              className={`w-9 h-9 rounded-full object-cover ring-2 ${
                isSelected ? 'ring-rose-200' : 'ring-slate-100'
              }`}
            />
            <div>
              <p
                className={`text-xs md:text-sm font-semibold leading-tight ${
                  isSelected ? 'text-rose-500' : 'text-slate-800'
                }`}
              >
                {child.name}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                Age {child.age}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}


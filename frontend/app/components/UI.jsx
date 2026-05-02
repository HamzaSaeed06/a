"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CaretDown,
  CheckCircle,
  Info,
  MagnifyingGlass,
  WarningCircle,
  X,
  DotsThree,
  List,
  GridFour,
} from "@phosphor-icons/react";
import { cn } from "../lib/format";

export function StatCard({ title, value, sub, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="surface p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-500 mb-1.5">
            {title}
          </p>
          <p className="text-4xl font-semibold text-slate-900 truncate tracking-tight">{value}</p>
          {sub ? <p className="mt-1 text-[0.75rem] text-slate-500 font-medium">{sub}</p> : null}
        </div>
        {Icon ? (
          <div className="shrink-0 text-slate-400">
            <Icon size={24} weight="regular" />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-h1">{title}</h1>
        {subtitle ? <p className="text-body mt-2">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}

export function SectionCard({ title, sub, action, children, padded = true }) {
  return (
    <section className="surface overflow-hidden">
      {(title || action || sub) && (
        <div className="border-b border-slate-200 px-6 py-5 bg-slate-50/50">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              {title ? <h2 className="text-h2 text-xl">{title}</h2> : null}
              {sub ? <p className="mt-1 text-sm text-slate-500">{sub}</p> : null}
            </div>
            {action ? <div className="flex flex-wrap gap-2.5">{action}</div> : null}
          </div>
        </div>
      )}
      <div className={padded ? "p-6" : ""}>{children}</div>
    </section>
  );
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative surface-elevated max-h-[90vh] overflow-hidden w-full flex flex-col shadow-2xl"
            style={{ maxWidth: width }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">{title}</h3>
              <button
                type="button"
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export function Field({ label, children, hint, error, icon: Icon }) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {Icon ? <Icon size={18} className="text-slate-400" /> : null}
        <span className="text-[0.75rem] font-semibold text-slate-700">
          {label}
        </span>
      </div>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  );
}

export function Spinner({ size = 20 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
      className="rounded-full border-2 border-slate-300 border-t-slate-800"
      style={{ width: size, height: size }}
    />
  );
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      {Icon ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 rounded-full bg-slate-100 p-6 text-slate-400"
        >
          <Icon size={32} weight="light" />
        </motion.div>
      ) : null}
      <h3 className="text-h3 mb-2">{title}</h3>
      {sub ? <p className="max-w-md text-body">{sub}</p> : null}
    </div>
  );
}

import { toast as hotToast } from "react-hot-toast";

export function Toast() {
  // Legacy component - Toaster is now handled globally in RootLayout
  return null;
}

export function useToast() {
  const toast = (message, type = "info") => {
    if (type === "success") {
      hotToast.success(message);
    } else if (type === "error") {
      hotToast.error(message);
    } else {
      hotToast(message, { icon: "ℹ️" });
    }
  };

  const removeToast = () => {
    hotToast.dismiss();
  };

  return { toasts: [], toast, removeToast };
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  danger = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={420}>
      <p className="text-body mb-8">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          className={cn("btn", danger ? "btn-primary bg-red-600 hover:bg-red-700" : "btn-primary")}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative w-full max-w-sm flex items-center">
      <MagnifyingGlass
        size={18}
        className="absolute left-3 text-slate-400 pointer-events-none"
      />
      <input
        className="input input-search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}



import { useRef, useEffect } from "react";

const SelectOption = ({ opt, value, onChange, setOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        onChange(opt.value);
        setOpen(false);
      }}
      style={{
        fontSize: '12px',
        backgroundColor: value === opt.value ? '#e2e8f0' : (isHovered ? '#f1f5f9' : 'transparent'),
        color: value === opt.value || isHovered ? '#0f172a' : '#475569',
      }}
      className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 font-semibold transition-colors duration-75"
    >
      {opt.label}
    </button>
  );
};

export function Select({ value, onChange, options, placeholder = "Select option", icon: Icon }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedLabel = options.find((opt) => opt.value === value)?.label || value || placeholder;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "input flex items-center justify-between gap-2 text-left transition-all",
          open && "border-slate-400 ring-2 ring-slate-100"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={16} className="text-slate-400 shrink-0" />}
          <span className={cn("truncate text-sm", !value && "text-slate-500")}>{selectedLabel}</span>
        </div>
        <CaretDown size={14} className={cn("text-slate-400 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            data-lenis-prevent
            className="absolute left-0 right-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/40 scrollbar-hide flex flex-col gap-0.5"
          >
            {options.map((opt) => (
              <SelectOption 
                key={opt.value} 
                opt={opt} 
                value={value} 
                onChange={onChange} 
                setOpen={setOpen} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

export function Pagination({ current, total, onPageChange }) {
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-white rounded-b-xl">
      <div className="text-xs font-semibold text-slate-500">
        Page {current} of {total}
      </div>
      <div className="flex gap-2">
        <button
          disabled={current === 1}
          onClick={() => onPageChange(current - 1)}
          className="btn-outline !h-8 !px-2 disabled:opacity-30"
        >
          <CaretLeft size={16} />
        </button>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => {
            const page = i + 1;
            // Only show first, last, and pages near current
            if (page === 1 || page === total || (page >= current - 1 && page <= current + 1)) {
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "btn !h-8 !w-8 !p-0 font-bold text-xs transition-all",
                    current === page ? "btn-primary" : "btn-ghost"
                  )}
                >
                  {page}
                </button>
              );
            }
            if (page === current - 2 || page === current + 2) {
              return <span key={page} className="px-1 text-slate-300">...</span>;
            }
            return null;
          })}
        </div>
        <button
          disabled={current === total}
          onClick={() => onPageChange(current + 1)}
          className="btn-outline !h-8 !px-2 disabled:opacity-30"
        >
          <CaretRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function TableDropdown({ options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none"
      >
        <DotsThree size={22} weight="bold" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="absolute right-0 z-[60] mt-1 w-36 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/50"
          >
            {options.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <button
                  key={i}
                  onClick={() => {
                    opt.onClick();
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-semibold transition-colors duration-75",
                    opt.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {Icon && <Icon size={16} />}
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ViewToggle({ mode, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200">
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cn(
          "flex items-center justify-center p-1.5 rounded transition-all duration-200",
          mode === "table" ? "text-slate-950 bg-slate-50" : "text-slate-300 hover:text-slate-600"
        )}
        title="List View"
      >
        <List size={20} weight={mode === "table" ? "bold" : "regular"} />
      </button>
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center justify-center p-1.5 rounded transition-all duration-200",
          mode === "grid" ? "text-slate-950 bg-slate-50" : "text-slate-300 hover:text-slate-600"
        )}
        title="Grid View"
      >
        <GridFour size={20} weight={mode === "grid" ? "bold" : "regular"} />
      </button>
    </div>
  );
}

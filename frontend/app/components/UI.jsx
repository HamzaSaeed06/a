"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Info,
  MagnifyingGlass,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { cn } from "../lib/format";

export function StatCard({ title, value, sub, icon: Icon, tone = "default" }) {
  const toneClasses =
    tone === "accent"
      ? "bg-[rgba(212,146,42,0.1)] text-[#f0aa3a] border border-[rgba(212,146,42,0.18)]"
      : tone === "success"
        ? "bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.18)]"
        : "bg-white/[0.06] text-white/60 border border-white/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className="card relative overflow-hidden p-5 rounded-2xl"
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/[0.02] blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-white/35">
            {title}
          </p>
          <p className="kpi-value mt-3 text-3xl font-bold truncate">{value}</p>
          {sub ? <p className="mt-1.5 text-xs text-white/40">{sub}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("rounded-xl p-2.5 shrink-0", toneClasses)}>
            <Icon size={20} weight="duotone" />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2.5">{action}</div> : null}
    </div>
  );
}

export function SectionCard({ title, sub, action, children, padded = true }) {
  return (
    <section className="card overflow-hidden rounded-2xl">
      {(title || action || sub) && (
        <div className="border-b border-white/[0.07] px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              {title ? <h2 className="section-title">{title}</h2> : null}
              {sub ? <p className="mt-1 text-xs text-white/40">{sub}</p> : null}
            </div>
            {action ? <div className="flex flex-wrap gap-2.5">{action}</div> : null}
          </div>
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Modal({ open, onClose, title, children, width = 560 }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="glass-card max-h-[88vh] overflow-hidden rounded-2xl border border-white/10"
            style={{ width, maxWidth: "100%" }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <h3 className="section-title">{title}</h3>
              <button
                className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/[0.07] hover:text-white/80"
                onClick={onClose}
              >
                <X size={17} />
              </button>
            </div>
            <div className="max-h-[calc(88vh-66px)] overflow-y-auto p-5">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Field({ label, children, hint, error }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/40">
        {label}
      </span>
      {children}
      {hint ? <span className="text-xs text-white/35">{hint}</span> : null}
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

export function Spinner({ size = 20 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
      className="rounded-full border-[1.5px] border-white/10 border-t-white/70"
      style={{ width: size, height: size }}
    />
  );
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-5 rounded-2xl bg-white/[0.06] border border-white/10 p-5 text-white/40"
        >
          <Icon size={32} weight="duotone" />
        </motion.div>
      ) : null}
      <h3 className="text-lg font-semibold text-white/80">{title}</h3>
      {sub ? <p className="mt-2 max-w-md text-sm leading-7 text-white/40">{sub}</p> : null}
    </div>
  );
}

export function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-5 right-5 z-[1200] flex max-w-sm flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            className="glass-card flex items-start gap-3 rounded-xl border border-white/10 p-3.5"
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" ? (
                <CheckCircle size={18} weight="fill" className="text-emerald-400" />
              ) : toast.type === "error" ? (
                <WarningCircle size={18} weight="fill" className="text-red-400" />
              ) : (
                <Info size={18} weight="fill" className="text-amber-400" />
              )}
            </div>
            <div className="flex-1 text-sm leading-6 text-white/75">{toast.message}</div>
            <button
              className="rounded-md p-1 text-white/30 transition hover:bg-white/[0.06] hover:text-white/60"
              onClick={() => removeToast(toast.id)}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const toast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => removeToast(id), 4200);
  };

  return { toasts, toast, removeToast };
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
      <p className="text-sm leading-7 text-white/55">{message}</p>
      <div className="mt-6 flex justify-end gap-2.5">
        <button className="btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button
          className={danger ? "btn-danger" : "btn-primary"}
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
    <div className="relative max-w-md">
      <MagnifyingGlass
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
      />
      <input
        className="input pl-9"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

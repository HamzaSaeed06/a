"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Info,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { cn } from "../lib/format";

export function StatCard({ title, value, sub, icon: Icon, tone = "default" }) {
  const toneClasses =
    tone === "accent"
      ? "bg-[rgba(15,118,110,0.1)] text-[var(--accent)]"
      : tone === "success"
        ? "bg-[rgba(34,197,94,0.1)] text-[var(--success)]"
        : "bg-slate-100 text-slate-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="card relative overflow-hidden p-6"
    >
      <div className="ambient-ring -right-8 -top-10 h-28 w-28" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-slate-400">
            {title}
          </p>
          <p className="kpi-value mt-4 text-4xl font-bold text-slate-950">{value}</p>
          {sub ? <p className="mt-2 text-sm text-[var(--muted)]">{sub}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("rounded-2xl p-3", toneClasses)}>
            <Icon size={22} weight="duotone" />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}

export function SectionCard({ title, sub, action, children, padded = true }) {
  return (
    <section className="card overflow-hidden">
      {(title || action || sub) && (
        <div className="border-b border-[var(--line)] px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              {title ? <h2 className="section-title">{title}</h2> : null}
              {sub ? <p className="mt-1 text-sm text-[var(--muted)]">{sub}</p> : null}
            </div>
            {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
          </div>
        </div>
      )}
      <div className={padded ? "p-6" : ""}>{children}</div>
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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(15,23,42,0.45)] px-4 py-8 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="glass-card max-h-[88vh] overflow-hidden rounded-[28px]"
            style={{ width, maxWidth: "100%" }}
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
              <h3 className="section-title">{title}</h3>
              <button className="btn-ghost !rounded-full !p-2" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[calc(88vh-76px)] overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Field({ label, children, hint, error }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      {children}
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      {error ? <span className="text-xs text-[var(--danger)]">{error}</span> : null}
    </label>
  );
}

export function Spinner({ size = 20 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      className="rounded-full border-2 border-slate-200 border-t-[var(--accent)]"
      style={{ width: size, height: size }}
    />
  );
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      {Icon ? (
        <div className="mb-5 rounded-full bg-[rgba(15,118,110,0.08)] p-5 text-[var(--accent)]">
          <Icon size={34} weight="duotone" />
        </div>
      ) : null}
      <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
      {sub ? <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--muted)]">{sub}</p> : null}
    </div>
  );
}

export function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[1200] flex max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            className="glass-card flex items-start gap-3 rounded-[24px] p-4"
          >
            <div className="mt-0.5">
              {toast.type === "success" ? (
                <CheckCircle size={20} weight="fill" className="text-[var(--success)]" />
              ) : toast.type === "error" ? (
                <WarningCircle size={20} weight="fill" className="text-[var(--danger)]" />
              ) : (
                <Info size={20} weight="fill" className="text-[var(--accent)]" />
              )}
            </div>
            <div className="flex-1 text-sm leading-6 text-slate-700">{toast.message}</div>
            <button className="btn-ghost !rounded-full !p-1.5" onClick={() => removeToast(toast.id)}>
              <X size={16} />
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
    setTimeout(() => removeToast(id), 4000);
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
      <p className="text-sm leading-7 text-[var(--muted)]">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
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
      <input
        className="input pl-4"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

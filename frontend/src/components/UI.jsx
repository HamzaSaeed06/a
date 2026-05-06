import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Lenis from "lenis";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { AnimatePresence, motion } from "framer-motion";
import {
  CaretDown,
  MagnifyingGlass,
  X,
  DotsThree,
  List,
  GridFour,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { cn } from "../lib/format";
import { toast as hotToast } from "react-hot-toast";

export const Button = React.forwardRef(({ className, variant = "primary", size = "default", loading = false, loadingText, children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all whitespace-nowrap border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden";
  const variants = {
    primary: "bg-teal-600 text-white border-teal-600 hover:bg-teal-700 hover:border-teal-700 active:scale-[0.98] shadow-sm hover:shadow-md",
    secondary: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300 active:scale-[0.98]",
    outline: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]",
    ghost: "bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200",
    danger: "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 active:scale-[0.98] shadow-sm"
  };
  const sizes = {
    default: "h-10 px-5 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 justify-center"
  };
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type={props.type || "button"}
      ref={ref}
      disabled={loading || props.disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (<><Spinner size={16} color={variant === "primary" ? "white" : "teal"} />{loadingText || children}</>) : children}
    </motion.button>
  );
});
Button.displayName = "Button";

export const Input = React.forwardRef(({ className, icon: Icon, ...props }, ref) => (
  <div className="relative w-full flex items-center group">
    {Icon && <Icon size={18} className="absolute left-3.5 text-slate-400 pointer-events-none group-focus-within:text-teal-600 transition-colors" />}
    <input
      ref={ref}
      className={cn("w-full rounded-lg border border-slate-200 bg-white h-11 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 hover:border-slate-300", Icon && "pl-11", className)}
      {...props}
    />
  </div>
));
Input.displayName = "Input";

export const Badge = ({ children, variant = "neutral", className }) => {
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    primary: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border", variants[variant] || variants.neutral, className)}
    >
      {children}
    </motion.span>
  );
};

export const RoleBadge = ({ role, className }) => {
  const getIcon = (r) => {
    const rl = r?.toLowerCase() || "";
    if (rl.includes("batsman")) return "🏏";
    if (rl.includes("bowler")) return "🔴";
    if (rl.includes("all-rounder")) return "🎖️";
    if (rl.includes("wicket-keeper")) return "🧤";
    return "👤";
  };
  return (
    <div className={cn("inline-flex items-center gap-2 text-ui", className)}>
      <span className="text-[1.2rem] leading-none drop-shadow-sm">{getIcon(role)}</span>
      <span className="capitalize">{role}</span>
    </div>
  );
};

export const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto relative no-scrollbar rounded-lg border border-slate-200">
    <table ref={ref} className={cn("w-full border-collapse text-left", className)} {...props} />
  </div>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("sticky top-0 z-10 bg-slate-50 border-b border-slate-200", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("bg-white divide-y divide-slate-100", className)} {...props} />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <motion.tr
    ref={ref}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ backgroundColor: "rgba(248, 250, 252, 1)" }}
    className={cn("transition-colors", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th ref={ref} className={cn("h-11 px-4 text-left align-middle text-xs font-semibold text-slate-500 uppercase tracking-wider", className)} {...props} />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("px-4 py-3 align-middle text-sm text-slate-600", className)} {...props} />
));
TableCell.displayName = "TableCell";

export function StatCard({ title, value, sub, icon: Icon, tone = "default" }) {
  const tones = {
    default: "bg-slate-50 text-slate-600",
    accent: "bg-teal-50 text-teal-600",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-200 rounded-xl p-5 transition-all hover:shadow-lg hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl text-slate-900 truncate tracking-tight font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {sub ? <p className="mt-1.5 text-xs text-slate-500 font-medium">{sub}</p> : null}
        </div>
        {Icon ? (
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }} 
            className={cn("shrink-0 h-10 w-10 rounded-lg flex items-center justify-center", tones[tone] || tones.default)}
          >
            <Icon size={20} weight="duotone" />
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </motion.div>
  );
}

export function SectionCard({ title, sub, action, children, padded = true, className, fullHeight = false }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md", fullHeight && "min-h-[calc(100vh-280px)] lg:min-h-[calc(100vh-220px)]", className)}
    >
      {(title || action || sub) && (
        <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
              {sub ? <p className="mt-0.5 text-sm text-slate-500">{sub}</p> : null}
            </div>
            {action ? <div className="flex flex-wrap gap-2.5">{action}</div> : null}
          </div>
        </div>
      )}
      <div className={cn("flex-1 flex flex-col", padded && "p-5")}>{children}</div>
    </motion.section>
  );
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      if (scrollRef.current) {
        const lenis = new Lenis({ wrapper: scrollRef.current, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => { lenis.destroy(); document.body.style.overflow = "unset"; };
      }
    } else { document.body.style.overflow = "unset"; }
  }, [open]);
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative bg-white border border-slate-200 rounded-xl max-h-[90vh] overflow-hidden w-full flex flex-col shadow-2xl" style={{ maxWidth: width }}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <button type="button" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" onClick={onClose}><X size={18} /></button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar"><div>{children}</div></div>
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
        {Icon ? <Icon size={18} className="text-slate-500" /> : null}
        <span className="text-ui-semibold text-slate-700">{label}</span>
      </div>
      {children}
      {hint ? <span className="text-ui-xs text-slate-600">{hint}</span> : null}
      {error ? <span className="text-ui-xs text-red-500">{error}</span> : null}
    </label>
  );
}

export function Spinner({ size = 20, color = "teal" }) {
  const colors = { 
    teal: "border-teal-200 border-t-teal-600", 
    slate: "border-slate-200 border-t-slate-600", 
    white: "border-white/30 border-t-white" 
  };
  return <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} className={cn("rounded-full border-2", colors[color] || colors.teal)} style={{ width: size, height: size }} />;
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center h-full min-h-[300px]">
      {Icon ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="mb-5 rounded-2xl bg-slate-100 p-5 text-slate-400"
        >
          <Icon size={28} weight="duotone" />
        </motion.div>
      ) : null}
      <h3 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h3>
      {sub ? <p className="max-w-sm text-sm text-slate-500">{sub}</p> : null}
    </div>
  );
}

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("skeleton animate-shimmer", className)}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <div className="skeleton h-4 w-32 rounded" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-4">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-3 w-1/4 rounded" />
            </div>
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Toast() { return null; }

export function useToast() {
  const toast = (message, type = "info") => {
    if (type === "success") hotToast.success(message);
    else if (type === "error") hotToast.error(message);
    else hotToast(message, { icon: "ℹ️" });
  };
  const removeToast = () => hotToast.dismiss();
  return { toasts: [], toast, removeToast };
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, danger = false, loading: externalLoading }) {
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(); onClose(); } catch (err) {} finally { setLoading(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title={title} width={420}>
      <p className="text-ui text-slate-600 mb-8">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={loading || externalLoading}>Cancel</Button>
        <Button variant="primary" className={danger ? "bg-red-600 hover:bg-red-700" : ""} loading={loading || externalLoading} loadingText="Processing..." onClick={handleConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return <Input value={value} onChange={onChange} placeholder={placeholder} icon={MagnifyingGlass} className="max-w-sm" />;
}

const SelectOption = ({ opt, value, onChange, setOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button type="button" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => { onChange(opt.value); setOpen(false); }}
      style={{ fontSize: "12px", backgroundColor: value === opt.value ? "#e2e8f0" : (isHovered ? "#f1f5f9" : "transparent"), color: value === opt.value || isHovered ? "#0f172a" : "#475569" }}
      className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-ui-semibold transition-colors duration-75"
    >{opt.label}</button>
  );
};

export function Select({ value, onChange, options, placeholder = "Select option", icon: Icon }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedLabel = options.find((opt) => opt.value === value)?.label || value || placeholder;
  useEffect(() => {
    function handleClickOutside(event) { if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false); }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  return (
    <div className="relative w-full" ref={containerRef}>
      <button type="button" onClick={() => setOpen(!open)} className={cn("w-full rounded-md border border-slate-200 bg-white h-10 px-3 text-sm text-slate-900 outline-none transition-all flex items-center justify-between gap-2 text-left hover:bg-slate-50", open && "border-slate-400 ring-2 ring-slate-100")}>
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={16} className="text-slate-500 shrink-0" />}
          <span className={cn("truncate text-ui", !value && "text-slate-600")}>{selectedLabel}</span>
        </div>
        <CaretDown size={14} className={cn("text-slate-500 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.1, ease: "easeOut" }} data-lenis-prevent
            className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/40 scrollbar-hide flex flex-col gap-0.5"
          >
            {options.length > 0 ? options.map((opt) => <SelectOption key={opt.value} opt={opt} value={value} onChange={onChange} setOpen={setOpen} />) : <div className="px-3 py-4 text-center"><p className="text-ui-xs font-semibold text-slate-400">No results found</p></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PaginationRoot = ({ className, ...props }) => <nav role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center md:justify-end", className)} {...props} />;
const PaginationContent = React.forwardRef(({ className, ...props }, ref) => <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />);
const PaginationItem = React.forwardRef(({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />);
const PaginationLink = ({ className, isActive, ...props }) => (
  <button type="button" aria-current={isActive ? "page" : undefined} onClick={props.onClick}
    className={cn("inline-flex h-9 w-9 items-center justify-center rounded-md text-ui-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50", isActive ? "bg-slate-900 text-white shadow hover:bg-slate-900/90" : "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900", className)}
    {...props}
  />
);
const PaginationPrevious = ({ className, ...props }) => (
  <button type="button" aria-label="Go to previous page" onClick={props.onClick} className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-ui-semibold transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50", className)} {...props}>
    <CaretLeft size={16} /><span className="hidden sm:inline">Previous</span>
  </button>
);
const PaginationNext = ({ className, ...props }) => (
  <button type="button" aria-label="Go to next page" onClick={props.onClick} className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-ui-semibold transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50", className)} {...props}>
    <span className="hidden sm:inline">Next</span><CaretRight size={16} />
  </button>
);
const PaginationEllipsis = ({ className, ...props }) => <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}><DotsThree size={18} weight="bold" /></span>;

export function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const getPages = () => {
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 2) return [1, 2, "ellipsis", total];
    if (current >= total - 1) return [1, "ellipsis", total - 1, total];
    return [1, "ellipsis", current, "ellipsis", total];
  };
  return (
    <PaginationRoot className="py-6 border-t border-slate-100 mt-4">
      <PaginationContent>
        <PaginationItem><PaginationPrevious disabled={current === 1} onClick={() => onChange(current - 1)} /></PaginationItem>
        {getPages().map((p, idx) => (
          <PaginationItem key={idx}>
            {p === "ellipsis" ? <PaginationEllipsis /> : <PaginationLink isActive={p === current} onClick={() => onChange(p)}>{p}</PaginationLink>}
          </PaginationItem>
        ))}
        <PaginationItem><PaginationNext disabled={current === total} onClick={() => onChange(current + 1)} /></PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}

export function TableDropdown({ options }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const ref = useRef(null);
  const updateCoords = () => {
    if (ref.current) { const rect = ref.current.getBoundingClientRect(); setCoords({ top: rect.bottom + window.scrollY + 4, left: rect.right + window.scrollX - 144 }); }
  };
  useEffect(() => { if (open) updateCoords(); }, [open]);
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event) { if (ref.current && !ref.current.contains(event.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", updateCoords);
    return () => { document.removeEventListener("mousedown", handleClickOutside); window.removeEventListener("resize", updateCoords); };
  }, [open]);
  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors focus:outline-none">
        <DotsThree size={22} weight="bold" />
      </button>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && coords && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.1 }}
              className="absolute z-[9999] w-36 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/50"
              style={{ top: coords.top, left: coords.left }}
            >
              {options.map((opt, i) => {
                const Icon = opt.icon;
                return (
                  <button key={i} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); opt.onClick(); setOpen(false); }}
                    className={cn("flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-ui-semibold transition-colors duration-75", opt.danger ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
                  >
                    {Icon && <Icon size={16} />}{opt.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export function ViewToggle({ mode, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200">
      <button type="button" onClick={() => onChange("table")} className={cn("flex items-center justify-center p-1.5 rounded transition-all duration-200", mode === "table" ? "text-slate-950 bg-slate-50" : "text-slate-300 hover:text-slate-600")} title="List View"><List size={20} weight={mode === "table" ? "bold" : "regular"} /></button>
      <button type="button" onClick={() => onChange("grid")} className={cn("flex items-center justify-center p-1.5 rounded transition-all duration-200", mode === "grid" ? "text-slate-950 bg-slate-50" : "text-slate-300 hover:text-slate-600")} title="Grid View"><GridFour size={20} weight={mode === "grid" ? "bold" : "regular"} /></button>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, width = "max-w-md" }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      if (scrollRef.current) {
        const lenis = new Lenis({ wrapper: scrollRef.current, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => { lenis.destroy(); document.body.style.overflow = "unset"; };
      }
    } else { document.body.style.overflow = "unset"; }
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-[2px]" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className={cn("fixed inset-y-0 right-0 z-[70] w-full bg-white shadow-2xl flex flex-col border-l border-slate-200", width)}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-h2 text-slate-900">{title}</h2>
              <button onClick={onClose} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"><X size={20} weight="bold" /></button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function MiniChart({ data, color = "#3b82f6", height = 60 }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 w-full" style={{ height: `${height}px` }}>
      {data.map((val, i) => {
        const h = (val / max) * 100;
        return <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} className="flex-1 rounded-sm" style={{ backgroundColor: color }} transition={{ delay: i * 0.05, duration: 0.5 }} />;
      })}
    </div>
  );
}

export function LineChart({ data = [], color = "#6366f1", height = 200, prefix = "", suffix = "" }) {
  const chartData = data.map((val, i) => ({ name: i, value: val }));
  if (!data || data.length < 2) {
    return <div className="w-full flex flex-col items-center justify-center border border-slate-100 bg-slate-50/30 rounded-2xl" style={{ height: `${height}px` }}><p className="text-ui text-slate-500 font-medium">No data available</p></div>;
  }
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorValue-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" hide />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} tickFormatter={(val) => `${prefix}${val}${suffix}`} />
          <Tooltip content={({ active, payload }) => {
            if (active && payload && payload.length) return <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl border border-slate-800 text-xs font-bold">{prefix}{payload[0].value}{suffix}</div>;
            return null;
          }} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fillOpacity={1} fill={`url(#colorValue-${color.replace("#", "")})`} animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

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
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all whitespace-nowrap border border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden";
  const variants = {
    primary: "bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.97]",
    outline: "bg-transparent text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-400 active:bg-blue-500/20",
    ghost: "bg-transparent text-gray-300 hover:bg-gray-700/30 hover:text-gray-100 active:bg-gray-700/50"
  };
  const sizes = {
    default: "h-10 px-5 text-ui-semibold",
    sm: "h-8 px-3 text-ui-xs font-semibold",
    icon: "h-9 w-9 justify-center"
  };
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      type={props.type || "button"}
      ref={ref}
      disabled={loading || props.disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (<><Spinner size={16} color={variant === "primary" ? "white" : "blue"} />{loadingText || children}</>) : children}
    </motion.button>
  );
});
Button.displayName = "Button";

export const Input = React.forwardRef(({ className, icon: Icon, ...props }, ref) => (
  <div className="relative w-full flex items-center group">
    {Icon && <Icon size={18} className="absolute left-3 text-gray-400 pointer-events-none group-focus-within:text-blue-400 transition-colors" />}
    <motion.input
      ref={ref}
      whileFocus={{ scale: 1.01 }}
      className={cn("w-full rounded-md border border-gray-700 bg-gray-900/50 h-10 px-3 text-ui text-white outline-none transition-all placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-900", Icon && "pl-10", className)}
      {...props}
    />
  </div>
));
Input.displayName = "Input";

export const Badge = ({ children, variant = "neutral", className }) => {
  const variants = {
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    danger: "bg-red-500/20 text-red-300 border-red-500/30",
    neutral: "bg-gray-700/40 text-gray-300 border-gray-600/40",
    gold: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    accent: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-ui-xs font-bold tracking-wide capitalize border backdrop-blur-sm", variants[variant] || variants.neutral, className)}
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
  <div className="w-full overflow-auto relative border-t border-gray-700 no-scrollbar">
    <table ref={ref} className={cn("w-full border-collapse text-left", className)} {...props} />
  </div>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("sticky top-0 z-10 bg-gray-900/50 border-b border-gray-700 backdrop-blur-sm", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("", className)} {...props} />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <motion.tr
    ref={ref}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
    className={cn("border-b border-gray-700 transition-colors", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th ref={ref} className={cn("h-12 px-4 text-left align-middle text-sub text-gray-300", className)} {...props} />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("px-4 py-2 align-middle text-ui text-gray-300 h-12", className)} {...props} />
));
TableCell.displayName = "TableCell";

export function StatCard({ title, value, sub, icon: Icon, tone = "default" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg shadow-lg p-6 transition-all hover:shadow-xl hover:shadow-blue-500/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sub text-gray-400 mb-2">{title}</p>
          <p className="text-h1 text-white truncate tracking-tight font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {sub ? <p className="mt-1 text-ui-xs text-gray-500 font-medium">{sub}</p> : null}
        </div>
        {Icon ? <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="shrink-0 text-blue-400"><Icon size={24} weight="regular" /></motion.div> : null}
      </div>
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-h1 text-slate-900">{title}</h1>
        {subtitle ? <p className="text-ui text-slate-900 mt-2">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}

export function SectionCard({ title, sub, action, children, padded = true, className, fullHeight = false }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg overflow-hidden flex flex-col backdrop-blur-sm transition-all hover:border-gray-600", fullHeight && "min-h-[calc(100vh-280px)] lg:min-h-[calc(100vh-220px)]", className)}
    >
      {(title || action || sub) && (
        <div className="border-b border-gray-700 px-6 py-5 bg-gray-900/30 backdrop-blur-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              {title ? <motion.h2 className="text-h3 text-white">{title}</motion.h2> : null}
              {sub ? <p className="mt-1 text-ui text-gray-400">{sub}</p> : null}
            </div>
            {action ? <div className="flex flex-wrap gap-2.5">{action}</div> : null}
          </div>
        </div>
      )}
      <div className={cn("flex-1 flex flex-col", padded && "p-6")}>{children}</div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative bg-gray-800 border border-gray-700 rounded-lg max-h-[90vh] overflow-hidden w-full flex flex-col shadow-2xl" style={{ maxWidth: width }}>
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-3 bg-gray-900/50">
              <h3 className="text-sm font-bold text-white capitalize tracking-wider">{title}</h3>
              <button type="button" className="rounded-md p-1 text-gray-400 transition hover:bg-gray-700 hover:text-white" onClick={onClose}><X size={18} /></button>
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

export function Spinner({ size = 20, color = "slate" }) {
  const colors = { slate: "border-slate-300 border-t-slate-800", white: "border-white/20 border-t-white" };
  return <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }} className={cn("rounded-full border-2", colors[color] || colors.slate)} style={{ width: size, height: size }} />;
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center h-full min-h-[400px]">
      {Icon ? <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 rounded-full bg-slate-100 p-6 text-slate-500"><Icon size={32} weight="light" /></motion.div> : null}
      <h3 className="text-h3 text-slate-900 mb-2">{title}</h3>
      {sub ? <p className="max-w-md text-ui text-slate-900">{sub}</p> : null}
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
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className={cn("fixed inset-y-0 right-0 z-[70] w-full bg-white shadow-2xl flex flex-col border-l border-slate-200", width)}>
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

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { EmptyState, SearchInput, SectionCard, ViewToggle, Pagination, Toast, useToast, Modal, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, Input, Field, TableDropdown } from "../../components/UI";
import { ListChecks, Heart, Clock, CheckCircle, Prohibit, ArrowsLeftRight, X, CoinVertical, HeartBreak } from "@phosphor-icons/react";
import { apiFetch } from "../../lib/api";
import { formatCurrency, cn } from "../../lib/format";

function CompareModal({ players, onClose }) {
  if (!players || players.length < 2) return null;
  const [a, b] = players;
  const rows = [{ label: "Role", va: a.role, vb: b.role }, { label: "Base Price", va: formatCurrency(a.base_price), vb: formatCurrency(b.base_price) }, { label: "Category", va: a.category_name, vb: b.category_name }, { label: "Country", va: a.country_name, vb: b.country_name }, { label: "Age", va: a.age ? `${a.age} yrs` : "—", vb: b.age ? `${b.age} yrs` : "—" }, { label: "Batting Style", va: a.batting_style || "—", vb: b.batting_style || "—" }, { label: "Bowling Style", va: a.bowling_style || "—", vb: b.bowling_style || "—" }];
  return (
    <Modal open={true} onClose={onClose} title="Player Comparison" width={600}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col items-center gap-2"><div className={cn("h-16 w-16 rounded-full flex items-center justify-center text-sm font-medium border border-slate-200 overflow-hidden", !a.image_url && "bg-slate-900 text-white")}>{a.image_url ? <img src={a.image_url} className="w-full h-full object-contain" /> : a.name?.substring(0, 2).toUpperCase()}</div><p className="text-ui-semibold text-slate-900 text-center leading-tight">{a.name}</p></div>
        <div className="flex items-center justify-center"><div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center"><ArrowsLeftRight size={16} className="text-slate-500" /></div></div>
        <div className="flex flex-col items-center gap-2"><div className={cn("h-16 w-16 rounded-full flex items-center justify-center text-sm font-medium border border-slate-200 overflow-hidden", !b.image_url && "bg-slate-900 text-white")}>{b.image_url ? <img src={b.image_url} className="w-full h-full object-contain" /> : b.name?.substring(0, 2).toUpperCase()}</div><p className="text-ui-semibold text-slate-900 text-center leading-tight">{b.name}</p></div>
      </div>
      <div className="space-y-1">{rows.map((row) => (<div key={row.label} className="grid grid-cols-3 items-center gap-2 py-2.5 border-b border-slate-50 last:border-0"><p className="text-ui text-slate-900">{row.va || "—"}</p><p className="text-sub text-slate-900 text-center">{row.label}</p><p className="text-ui text-slate-900 text-right">{row.vb || "—"}</p></div>))}</div>
    </Modal>
  );
}

function WishlistSettingsModal({ player, currentMax, currentPriority, onClose, onSave, loading }) {
  const [val, setVal] = useState(currentMax ? String(currentMax) : "");
  const [priority, setPriority] = useState(currentPriority || "primary");
  return (
    <Modal open={true} onClose={onClose} title="Wishlist Settings" width={400}>
      <div className="flex items-center gap-3 mb-5 p-3 rounded-md bg-slate-50"><div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden", !player.image_url && "bg-slate-900 text-white")}>{player.image_url ? <img src={player.image_url} className="w-full h-full object-contain" /> : player.name?.substring(0, 2).toUpperCase()}</div><div><p className="text-ui-semibold text-slate-900">{player.name}</p><p className="text-sub text-slate-900">{player.role} · Base: {formatCurrency(player.base_price)}</p></div></div>
      <div className="mb-5"><p className="text-ui font-semibold text-slate-900 mb-2">Target Priority</p><div className="flex gap-2">{["primary", "secondary", "avoid"].map((p) => (<button key={p} onClick={() => setPriority(p)} className={cn("flex-1 py-2.5 rounded-md border text-ui-semibold capitalize transition-colors", priority === p ? p === "avoid" ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}>{p}</button>))}</div></div>
      <div className="mb-2"><p className="text-ui font-semibold text-slate-900 mb-2">Max Bid Limit (Optional)</p><Input value={val} onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 75000000" icon={CoinVertical} disabled={priority === "avoid"} />{val && priority !== "avoid" && <p className="text-ui-xs text-slate-400 mt-2">= {formatCurrency(Number(val))}</p>}</div>
      <div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="primary" loading={loading} loadingText="Saving..." onClick={() => onSave({ max_bid: priority === "avoid" ? null : Number(val) || null, priority })}>Save Settings</Button></div>
    </Modal>
  );
}

export default function FranchisePoolPage() {
  const [pool, setPool] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [settingsPlayer, setSettingsPlayer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const { toasts, toast, removeToast } = useToast();
  const PAGE_SIZE = 8;

  const fetchAll = () => { apiFetch("/franchise/pool").then(setPool).catch((err) => toast("Failed to load auction pool: " + err.message, "error")); apiFetch("/franchise/wishlist").then(setWishlist).catch(() => {}); };
  useEffect(() => { fetchAll(); }, []);

  const toggleWishlist = async (player_id) => { setToggling(player_id); try { await apiFetch("/franchise/wishlist/toggle", { method: "POST", body: JSON.stringify({ player_id }) }); fetchAll(); } catch (err) { toast("Action failed: " + err.message, "error"); } finally { setToggling(null); } };
  const saveSettings = async (player_id, settings) => { setSaving(true); try { await apiFetch("/franchise/wishlist/max-bid", { method: "PATCH", body: JSON.stringify({ player_id, max_bid: settings.max_bid }) }); await apiFetch("/franchise/wishlist/priority", { method: "PATCH", body: JSON.stringify({ player_id, priority: settings.priority }) }); setSettingsPlayer(null); fetchAll(); toast("Target settings updated successfully.", "success"); } catch (err) { toast("Failed to save settings: " + err.message, "error"); } finally { setSaving(false); } };
  const toggleCompare = (item) => { setCompareList((prev) => { if (prev.find((p) => p.player_id === item.player_id)) return prev.filter((p) => p.player_id !== item.player_id); if (prev.length >= 2) { toast("Only 2 players can be compared at once.", "error"); return prev; } return [...prev, item]; }); };

  const poolWithMeta = useMemo(() => { const wMap = {}; wishlist.forEach((w) => { wMap[w.player_id] = w; }); return pool.map((p) => ({ ...p, is_wishlisted: !!wMap[p.player_id], max_bid: wMap[p.player_id]?.max_bid || null, priority: wMap[p.player_id]?.priority || p.wishlist_priority || "primary" })); }, [pool, wishlist]);
  const budgetPlannerTotal = useMemo(() => wishlist.filter(w => w.priority !== "avoid").reduce((sum, w) => sum + Number(w.max_bid || 0), 0), [wishlist]);
  const filtered = poolWithMeta.filter((item) => [item.name, item.role, item.category_name].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusIcon = (s) => s === "active" ? <Clock size={12} weight="bold" /> : s === "processed" ? <Prohibit size={12} weight="bold" /> : <CheckCircle size={12} weight="bold" />;
  const statusClass = (s) => s === "active" ? "badge-accent" : s === "processed" ? "badge-neutral" : "badge-success";

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      {showCompare && compareList.length === 2 && <CompareModal players={compareList} onClose={() => setShowCompare(false)} />}
      {settingsPlayer && <WishlistSettingsModal player={settingsPlayer} currentMax={settingsPlayer.max_bid} currentPriority={settingsPlayer.priority} onClose={() => setSettingsPlayer(null)} onSave={(settings) => saveSettings(settingsPlayer.player_id, settings)} loading={saving} />}
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-h1 text-slate-900">Auction Pool</h1><p className="text-sub text-slate-900">View all queued players, set targets and max bids, compare candidates.</p></div>
        {compareList.length === 2 && <Button variant="primary" onClick={() => setShowCompare(true)}><ArrowsLeftRight size={16} /> Compare Selected</Button>}
      </div>
      {wishlist.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <SectionCard title="Targets Set" sub="Players in your watchlist."><p className="text-h2 text-slate-950 mt-1">{wishlist.length}</p></SectionCard>
          <SectionCard title="Committed Budget" sub="Sum of all max bids set."><p className="text-h2 text-slate-950 mt-1">{budgetPlannerTotal > 0 ? formatCurrency(budgetPlannerTotal) : "—"}</p></SectionCard>
          <SectionCard title="Players with Max Bid" sub="Budget limits configured."><p className="text-h2 text-slate-950 mt-1">{wishlist.filter((w) => w.max_bid).length} / {wishlist.length}</p></SectionCard>
        </div>
      )}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4 flex items-center justify-between p-3 rounded-md bg-slate-900 text-white">
            <p className="text-ui font-medium">{compareList.length === 1 ? `${compareList[0].name} selected — pick 1 more to compare` : `${compareList[0].name} vs ${compareList[1].name}`}</p>
            <div className="flex gap-2">{compareList.length === 2 && <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowCompare(true)}>Compare Now</Button>}<button onClick={() => setCompareList([])} className="text-white/60 hover:text-white"><X size={16} /></button></div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search players, role, category..." />
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>
      <SectionCard padded={false} fullHeight={true}>
        {filtered.length ? (
          <>
            {viewMode === "table" ? (
              <Table>
                <TableHeader><TableRow><TableHead>Lot</TableHead><TableHead>Player</TableHead><TableHead>Role</TableHead><TableHead>Base Price</TableHead><TableHead>Status</TableHead><TableHead>Max Bid</TableHead><TableHead className="w-16">Options</TableHead></TableRow></TableHeader>
                <TableBody>
                  {paginated.map((item) => {
                    const inCompare = compareList.find((p) => p.player_id === item.player_id);
                    return (
                      <TableRow key={item.player_id} className={inCompare ? "bg-slate-50" : ""}>
                        <TableCell className="font-bold text-slate-400">#{item.lot_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn("h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-[11px] font-medium overflow-hidden border border-slate-100 shadow-sm", !item.image_url && "bg-slate-900 text-white")}>{item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-contain" /> : item.name?.substring(0, 2).toUpperCase()}</div>
                            <div><div className="flex items-center gap-2">{item.country_code && <img src={`https://flagcdn.com/w20/${item.country_code.toLowerCase()}.png`} className="w-4 h-3 object-contain" />}<span className="font-semibold text-slate-900">{item.name}</span></div><p className="text-[10px] text-slate-400 font-medium">{item.category_name}</p></div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500">{item.role}</TableCell>
                        <TableCell className="font-bold text-slate-900">{formatCurrency(item.base_price)}</TableCell>
                        <TableCell><span className={cn("badge gap-1", statusClass(item.status))}>{statusIcon(item.status)}{item.status}</span></TableCell>
                        <TableCell>{item.is_wishlisted ? (item.priority === "avoid" ? <span className="text-ui-xs font-bold px-2 py-1 bg-red-50 text-red-600 rounded border border-red-100 uppercase">Do Not Buy</span> : <button onClick={() => setSettingsPlayer(item)} className={cn("text-ui-xs font-bold px-2 py-1 rounded-md border transition-colors", item.max_bid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200")}>{item.max_bid ? formatCurrency(item.max_bid) : "Set limit"}</button>) : <span className="text-ui-xs text-slate-300">—</span>}</TableCell>
                        <TableCell><TableDropdown options={[{ label: item.is_wishlisted ? "Remove Wishlist" : "Add to Wishlist", icon: item.is_wishlisted ? HeartBreak : Heart, onClick: () => toggleWishlist(item.player_id) }, { label: inCompare ? "Remove Compare" : "Compare Player", icon: ArrowsLeftRight, onClick: () => toggleCompare(item) }]} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-slate-50/50">
                {paginated.map((item) => {
                  const inCompare = compareList.find((p) => p.player_id === item.player_id);
                  return (
                    <div key={item.player_id} className={cn("surface group bg-white border transition-all duration-200 overflow-hidden", inCompare ? "border-slate-900" : "border-slate-100 hover:border-slate-400")}>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-sm font-medium border border-slate-100 shadow-sm overflow-hidden", !item.image_url && "bg-slate-900 text-white")}>{item.image_url ? <img src={item.image_url} className="w-full h-full object-contain" /> : item.name?.substring(0, 2).toUpperCase()}</div>
                          <div onClick={(e) => e.stopPropagation()}><TableDropdown options={[{ label: item.is_wishlisted ? "Remove Wishlist" : "Add to Wishlist", icon: item.is_wishlisted ? HeartBreak : Heart, onClick: () => toggleWishlist(item.player_id) }, { label: inCompare ? "Remove Compare" : "Compare Player", icon: ArrowsLeftRight, onClick: () => toggleCompare(item) }]} /></div>
                        </div>
                        <h3 className="text-ui-semibold text-slate-900 truncate mb-0.5">{item.name}</h3>
                        <p className="text-sub text-slate-900 mb-4">{item.role}</p>
                        <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-50 mb-4"><div><span className="block text-[9px] text-slate-400 font-bold uppercase">Base Price</span><span className="text-ui-semibold text-slate-900">{formatCurrency(item.base_price)}</span></div><div className="text-right"><span className="block text-[9px] text-slate-400 font-bold uppercase">Lot</span><span className="text-ui text-slate-400">#{item.lot_number}</span></div></div>
                        {item.is_wishlisted && (<div className="flex items-center gap-2">{item.priority === "avoid" ? <div className="flex-1 text-ui-xs text-center font-bold py-1.5 bg-red-50 text-red-600 rounded border border-red-100 uppercase">DO NOT BUY</div> : <button onClick={() => setSettingsPlayer(item)} className={cn("flex-1 text-[10px] font-bold py-1.5 rounded-md border transition-colors", item.max_bid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200")}>{item.max_bid ? formatCurrency(item.max_bid) : "Set Max Bid"}</button>}</div>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : <EmptyState icon={ListChecks} title="No players found" sub="Auction pool is empty or no match for search." />}
      </SectionCard>
      <div className="mt-2"><Pagination current={page} total={totalPages} onChange={setPage} /></div>
    </DashboardLayout>
  );
}

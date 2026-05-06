import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../lib/image";
import { Calendar, Eye, GlobeHemisphereWest, IdentificationBadge, Image as ImageIcon, Money, PencilSimple, Person, Plus, Shield, Star, Tag, Trash, UserCircleGear, Video, CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import { ConfirmModal, EmptyState, Field, Modal, PageHeader, SearchInput, Select, SectionCard, Pagination, TableDropdown, ViewToggle, Toast, useToast, Button, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, RoleBadge, Drawer } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { formatCurrency, cn } from "../../lib/format";
import { countriesData } from "../../lib/countries";

const BATTING = ["Right-hand bat", "Left-hand bat"];
const BOWLING = ["Right-arm fast", "Right-arm fast-medium", "Right-arm medium-fast", "Right-arm medium", "Right-arm slow-medium", "Right-arm off-break", "Right-arm leg-break", "Right-arm off-spin", "Right-arm leg-spin", "Left-arm fast", "Left-arm fast-medium", "Left-arm medium-fast", "Left-arm medium", "Left-arm slow-medium", "Left-arm orthodox", "Left-arm wrist-spin", "Left-arm chinaman", "Slow left-arm orthodox", "N/A"];
const ROLES = ["Batsman", "Opening Batsman", "Top-order Batsman", "Middle-order Batsman", "Wicket-keeper", "Wicket-keeper Batsman", "All-rounder", "Batting All-rounder", "Bowling All-rounder", "Bowler"];
const emptyForm = { name: "", age: "", role: "Batsman", batting_style: "Right-hand bat", bowling_style: "N/A", base_price: 500000, category_id: "", country_id: "" };

function ImageCropModal({ open, image, onCropComplete, onClose, aspect = 1, shape = "round" }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  if (!image) return null;
  return (
    <Modal open={open} onClose={onClose} title="Adjust Photo" width={500}>
      <div className="relative h-80 w-full bg-slate-900 overflow-hidden rounded-lg">
        <Cropper image={image} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} cropShape={shape} showGrid={false} />
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[40px]">Zoom</span>
          <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-slate-900 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={async () => { const blob = await getCroppedImg(image, croppedAreaPixels); onCropComplete(blob); onClose(); }}>Save Adjustment</Button>
        </div>
      </div>
    </Modal>
  );
}

function DirectAssignModal({ open, player, teams, auctions, onComplete, onClose }) {
  const [form, setForm] = useState({ team_id: "", price: player?.base_price || 0 });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (player) setForm({ team_id: "", price: player.base_price }); }, [player]);
  const handleAssign = async () => {
    if (!form.team_id) return alert("Select a team.");
    const auction = auctions?.[0];
    if (!auction) return alert("No active auction season found.");
    setSaving(true);
    try {
      await apiFetch(`/admin/players/${player.player_id}/direct-assign`, { method: "POST", body: JSON.stringify({ team_id: form.team_id, price: form.price, auction_id: auction.auction_id, season: auction.season }) });
      onComplete(); onClose();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title={`Directly Sign ${player?.name}`} width={400}>
      <div className="space-y-4">
        <Field label="Target Team" icon={Shield}><Select value={form.team_id} onChange={(val) => setForm(f => ({ ...f, team_id: val }))} options={teams.map(t => ({ label: t.team_name, value: t.team_id }))} placeholder="Select team" /></Field>
        <Field label="Signing Price" icon={Money}><Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} /></Field>
        <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="primary" loading={saving} onClick={handleAssign}>Assign to Squad</Button></div>
      </div>
    </Modal>
  );
}

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editPlayer, setEditPlayer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [actionImageFile, setActionImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [saving, setSaving] = useState(false);
  const [cropModal, setCropModal] = useState({ open: false, image: null, type: null });
  const { toasts, toast, removeToast } = useToast();
  const PAGE_SIZE = 7;

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropModal({ open: true, image: reader.result, type });
    reader.readAsDataURL(file);
  };

  const fetchAll = () => {
    apiFetch("/admin/players").then(setPlayers).catch((err) => toast("Failed to load players: " + err.message, "error"));
    apiFetch("/super-admin/categories").then(setCategories).catch(() => {});
    apiFetch("/super-admin/countries").then(setCountries).catch(() => {});
    apiFetch("/admin/teams").then(setTeams).catch(() => {});
    apiFetch("/super-admin/auctions").then(setAuctions).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = players.filter((player) => [player.name, player.role, player.country_name, player.category_name].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search]);

  const openAdd = () => { setEditPlayer(null); setForm({ ...emptyForm, category_id: categories[0]?.category_id || "", country_id: countries[0]?.country_id || "" }); setImageFile(null); setActionImageFile(null); setVideoFile(null); setModal(true); };
  const openEdit = (player) => { setEditPlayer(player); setForm({ name: player.name, age: player.age || "", role: player.role || "Batsman", batting_style: player.batting_style || "Right-hand bat", bowling_style: player.bowling_style || "N/A", base_price: player.base_price, category_id: player.category_id || "", country_id: player.country_id || "" }); setImageFile(null); setActionImageFile(null); setVideoFile(null); setModal(true); };

  const save = async () => {
    if (!form.name) return toast("Player name is required.", "error");
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (imageFile) payload.append("image", imageFile, "profile.jpg");
      if (actionImageFile) payload.append("action_image", actionImageFile, "action.jpg");
      if (videoFile) payload.append("video", videoFile);
      if (editPlayer) { await apiFetch(`/admin/players/${editPlayer.player_id}`, { method: "PUT", body: payload }); toast("Player profile updated successfully.", "success"); }
      else { await apiFetch("/admin/players", { method: "POST", body: payload }); toast("New player added successfully to the registry.", "success"); }
      setModal(false); fetchAll();
    } catch (error) { toast(error.message || "An error occurred while saving the player profile.", "error"); } finally { setSaving(false); }
  };

  const remove = async (id) => {
    try { await apiFetch(`/admin/players/${id}`, { method: "DELETE" }); toast("Player profile removed successfully.", "success"); fetchAll(); }
    catch (error) { toast(error.message || "Failed to remove the player profile.", "error"); }
  };

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PlayerStatsOverlay player={preview} visible={!!preview} bidAmount={preview?.base_price} onClose={() => setPreview(null)} />
      <PageHeader title="Player Registry" subtitle="Manage player pool and profiles" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, role, country, or category..." />
        <div className="flex items-center gap-3">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Button variant="primary" className="shrink-0" onClick={openAdd}><Plus size={18} />Add Player</Button>
        </div>
      </div>
      <div className="mt-6">
        <SectionCard padded={false} fullHeight={true}>
          {filtered.length ? (
            <>
              {viewMode === "table" ? (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>S.No</TableHead><TableHead>Player</TableHead><TableHead>Role</TableHead>
                    <TableHead>Country</TableHead><TableHead>Category</TableHead><TableHead>Base Price</TableHead>
                    <TableHead>Status</TableHead><TableHead className="w-16">Options</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {paginated.map((player, index) => (
                      <TableRow key={player.player_id} className="hover:bg-slate-50/80">
                        <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn("h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border border-slate-100 shadow-sm overflow-hidden", !player.image_url && "bg-slate-900 text-white")}>
                              {player.image_url ? <img src={player.image_url} alt="" className="w-full h-full object-contain" /> : player.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="text-ui-semibold text-slate-950">{player.name}</div>
                          </div>
                        </TableCell>
                        <TableCell><RoleBadge role={player.role} /></TableCell>
                        <TableCell className="text-slate-500">
                          <div className="flex items-center gap-1">
                            {player.country_code && <img src={`https://flagcdn.com/w40/${player.country_code.toLowerCase()}.png`} alt="" className="country-flag" />}
                            <span className="text-ui truncate">{player.country_name || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 capitalize">{player.category_name || "-"}</TableCell>
                        <TableCell className="font-bold text-slate-900">{formatCurrency(player.base_price)}</TableCell>
                        <TableCell><Badge variant={player.status === "sold" ? "success" : player.status === "unsold" ? "neutral" : "gold"}>{player.status}</Badge></TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <TableDropdown options={[
                            { label: "Edit", icon: PencilSimple, onClick: () => openEdit(player) },
                            ...(player.status === "unsold" ? [{ label: "Direct Sign", icon: CheckCircle, onClick: () => { setSelectedPlayer(player); setAssignModal(true); } }] : []),
                            { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(player.player_id) }
                          ]} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="overflow-auto relative border-t border-slate-100 no-scrollbar">
                  <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8 bg-slate-50/50">
                    {paginated.map((player) => (
                      <div key={player.player_id} className="surface group hover:border-slate-900 transition-all duration-300">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <div className={cn("h-12 w-12 shrink-0 rounded-full flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm", !player.image_url && "bg-slate-950 text-white")}>
                                {player.image_url ? <img src={player.image_url} alt="" className="w-full h-full object-contain" /> : <span className="text-sm font-bold">{player.name?.substring(0, 2).toUpperCase()}</span>}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-ui-semibold text-slate-950 truncate leading-none mb-1">{player.name}</h3>
                                <div className="flex items-center gap-1.5">
                                  {player.country_code && <img src={`https://flagcdn.com/w20/${player.country_code.toLowerCase()}.png`} alt="" className="h-2.5 w-4 object-contain rounded-[1px]" />}
                                  <RoleBadge role={player.role} />
                                </div>
                              </div>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <TableDropdown options={[{ label: "Edit", icon: PencilSimple, onClick: () => openEdit(player) }, { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(player.player_id) }]} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                            <div className="flex flex-col gap-1"><span className="text-ui-xs font-medium text-slate-400 capitalize tracking-tight">Base Price</span><span className="text-ui-semibold text-slate-900">{formatCurrency(player.base_price)}</span></div>
                            <div className="flex flex-col gap-1"><span className="text-ui-xs font-medium text-slate-400 capitalize tracking-tight">Category</span><span className="text-ui-xs font-bold text-slate-600 capitalize tracking-wider">{player.category_name || "N/A"}</span></div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50">
                              <div className={cn("h-1.5 w-1.5 rounded-full", player.status === "sold" ? "bg-emerald-500" : player.status === "withdrawn" ? "bg-red-500" : "bg-slate-300")} />
                              <span className="text-ui-xs font-semibold text-slate-600 capitalize">{player.status || "unsold"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState icon={IdentificationBadge} title="No players registered" sub="Add the first player profile to start building the auction pool." />
          )}
        </SectionCard>
        <div className="mt-2"><Pagination current={page} total={totalPages} onChange={setPage} /></div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editPlayer ? "Edit Player" : "Create Player"}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name" icon={Person}><Input placeholder="e.g. Babar Azam" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} /></Field>
          <Field label="Age" icon={Calendar}><Input type="number" placeholder="e.g. 28" value={form.age} onChange={(e) => setForm((c) => ({ ...c, age: e.target.value }))} /></Field>
          <Field label="Role" icon={UserCircleGear}><Select value={form.role} onChange={(val) => setForm((c) => ({ ...c, role: val }))} options={ROLES.map(r => ({ label: r, value: r }))} /></Field>
          <Field label="Base Price" icon={Money}><Input type="number" placeholder="e.g. 500000" value={form.base_price} onChange={(e) => setForm((c) => ({ ...c, base_price: e.target.value }))} /></Field>
          <Field label="Batting Style" icon={Star}><Select value={form.batting_style} onChange={(val) => setForm((c) => ({ ...c, batting_style: val }))} options={BATTING.map(s => ({ label: s, value: s }))} /></Field>
          <Field label="Bowling Style" icon={Star}><Select value={form.bowling_style} onChange={(val) => setForm((c) => ({ ...c, bowling_style: val }))} options={BOWLING.map(s => ({ label: s, value: s }))} /></Field>
          <Field label="Category" icon={Tag}>
            <Select value={form.category_id} onChange={(val) => { const cat = categories.find(c => String(c.category_id) === String(val)); setForm((c) => ({ ...c, category_id: val, base_price: cat?.base_price || c.base_price })); }} options={categories.map(c => ({ label: c.category_name, value: c.category_id }))} placeholder="Select category" />
          </Field>
          <Field label="Country" icon={GlobeHemisphereWest}><Select value={form.country_id} onChange={(val) => setForm((c) => ({ ...c, country_id: val }))} options={countries.map(c => ({ label: c.country_name, value: c.country_id }))} placeholder="Select country" /></Field>
          <Field label="Profile Photo" icon={ImageIcon}><Input className="!py-1.5" type="file" accept="image/*" onChange={(e) => handleFileSelect(e, "image")} /></Field>
          <Field label="Action Photo" icon={ImageIcon}><Input className="!py-1.5" type="file" accept="image/*" onChange={(e) => handleFileSelect(e, "action_image")} /></Field>
          <Field label="Player Video" icon={Video}><Input className="!py-1.5" type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={save} loading={saving} loadingText="Saving Details...">Save Player</Button>
        </div>
      </Modal>

      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => remove(confirm)} title="Delete Player" message="This permanently removes the player and linked stat history." danger />

      <ImageCropModal open={cropModal.open} image={cropModal.image} aspect={cropModal.type === "image" ? 1 : 16 / 10} shape={cropModal.type === "image" ? "round" : "rect"} onClose={() => setCropModal({ open: false, image: null, type: null })}
        onCropComplete={(blob) => { if (cropModal.type === "image") setImageFile(blob); else setActionImageFile(blob); }} />

      <DirectAssignModal open={assignModal} player={selectedPlayer} teams={teams} auctions={auctions} onClose={() => setAssignModal(false)} onComplete={() => { toast("Player assigned to squad successfully.", "success"); fetchAll(); }} />
    </DashboardLayout>
  );
}

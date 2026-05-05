"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Buildings, User } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  PageHeader,
  SectionCard,
  Button,
  Input,
  Field,
  Toast,
  useToast,
  Drawer,
} from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { cn } from "../../lib/format";

export default function FranchiseProfilePage() {
  const [team, setTeam]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [form, setForm]       = useState({ 
    team_name: "", 
    city: "", 
    home_ground: "", 
    owner_name: "",
    username: "",
    email: "",
    password: "" 
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [ownerFile, setOwnerFile] = useState(null);
  const [logoPreview,  setLogoPreview]  = useState(null);
  const [ownerPreview, setOwnerPreview] = useState(null);
  
  const logoRef  = useRef(null);
  const ownerRef = useRef(null);
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    apiFetch("/franchise/my-team").then((data) => {
      setTeam(data);
      // Also fetch user credentials
      apiFetch("/auth/me").then((userData) => {
        setForm({
          team_name:  data.team_name  || "",
          city:       data.city       || "",
          home_ground: data.home_ground || "",
          owner_name: data.owner_name || "",
          username:   userData.username || "",
          email:      userData.email    || "",
          password:   ""
        });
      });
    }).catch(() => toast("Failed to load team data.", "error"));
  }, []);

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "logo") {
      setLogoPreview(url);
      setLogoFile(file);
    } else {
      setOwnerPreview(url);
      setOwnerFile(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Update Team Details
      const fd = new FormData();
      fd.append("team_name",   form.team_name);
      fd.append("city",        form.city);
      fd.append("home_ground", form.home_ground);
      fd.append("owner_name",  form.owner_name);
      if (logoFile)  fd.append("logo",        logoFile);
      if (ownerFile) fd.append("owner_image", ownerFile);

      const teamData = await apiFetch("/franchise/my-team", {
        method:  "PUT",
        body:    fd,
      });

      // 2. Update User Credentials
      await apiFetch("/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email:    form.email,
          password: form.password || undefined
        }),
      });

      setTeam(teamData);
      setIsEditOpen(false);
      setForm(f => ({ ...f, password: "" })); // Clear password
      toast("Profile updated successfully!", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader
        title="Franchise Profile"
        subtitle="View and manage your franchise details."
        action={
          <Button variant="primary" onClick={() => setIsEditOpen(true)}>
            Update Profile
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Summary Cards (Read-only) */}
        <div className="space-y-6">
          <SectionCard>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className={cn("h-28 w-28 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center shrink-0", !team?.logo_url && "bg-slate-100")}>
                {team?.logo_url ? (
                  <img src={team.logo_url} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <Buildings size={36} className="text-slate-300" />
                )}
              </div>
              <div>
                <h2 className="text-h2 text-slate-900">{team?.team_name || "—"}</h2>
                <p className="text-ui text-slate-500 mt-1">{team?.city || "—"}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-center gap-4">
              <div className={cn("h-16 w-16 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center shrink-0", !team?.owner_image_url && "bg-slate-100")}>
                {team?.owner_image_url ? (
                  <img src={team.owner_image_url} className="w-full h-full object-contain" alt="Owner" />
                ) : (
                  <User size={24} className="text-slate-300" />
                )}
              </div>
              <div>
                <p className="text-ui-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Owner</p>
                <h3 className="text-h3 text-slate-900">{team?.owner_name || "—"}</h3>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Detailed Info (Read-only) */}
        <div className="lg:col-span-2">
          <SectionCard title="Franchise Information" sub="Key details and budget tracking.">
            <div className="grid gap-6 sm:grid-cols-2 mt-2">
              <div>
                <p className="text-ui-xs text-slate-400 font-medium mb-1">Team Name</p>
                <p className="text-ui-semibold text-slate-900">{team?.team_name || "—"}</p>
              </div>
              <div>
                <p className="text-ui-xs text-slate-400 font-medium mb-1">City</p>
                <p className="text-ui-semibold text-slate-900">{team?.city || "—"}</p>
              </div>
              <div>
                <p className="text-ui-xs text-slate-400 font-medium mb-1">Home Ground</p>
                <p className="text-ui-semibold text-slate-900">{team?.home_ground || "—"}</p>
              </div>
              <div>
                <p className="text-ui-xs text-slate-400 font-medium mb-1">Owner Name</p>
                <p className="text-ui-semibold text-slate-900">{team?.owner_name || "—"}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-md bg-slate-50">
                <p className="text-sub text-slate-900 mb-1">Total Budget</p>
                <p className="text-ui-semibold text-slate-900">{team?.total_budget ? `Rs. ${(team.total_budget / 10000000).toFixed(1)} Cr` : "—"}</p>
              </div>
              <div className="p-4 rounded-md bg-slate-50">
                <p className="text-sub text-slate-900 mb-1">Remaining Budget</p>
                <p className="text-ui-semibold text-slate-900">{team?.remaining_budget ? `Rs. ${(team.remaining_budget / 10000000).toFixed(1)} Cr` : "—"}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Edit Profile Drawer ── */}
      <Drawer
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Update Profile"
        width="max-w-md"
      >
        <div className="p-6 space-y-8 pb-24">
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-3">
              <span className="text-ui-xs font-bold text-slate-500 uppercase">Team Logo</span>
              <div
                className={cn("relative h-20 w-20 rounded-full border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors group", !(logoPreview || team?.logo_url) && "bg-slate-100")}
                onClick={() => logoRef.current?.click()}
              >
                {logoPreview || team?.logo_url ? (
                  <img src={logoPreview || team?.logo_url} className="absolute inset-0 w-full h-full object-contain" alt="Team logo" />
                ) : (
                  <Buildings size={24} className="text-slate-300" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "logo")} />
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-ui-xs font-bold text-slate-500 uppercase">Owner Image</span>
              <div
                className={cn("relative h-20 w-20 rounded-full border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors group", !(ownerPreview || team?.owner_image_url) && "bg-slate-100")}
                onClick={() => ownerRef.current?.click()}
              >
                {ownerPreview || team?.owner_image_url ? (
                  <img src={ownerPreview || team?.owner_image_url} className="absolute inset-0 w-full h-full object-contain" alt="Owner" />
                ) : (
                  <User size={24} className="text-slate-300" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <input ref={ownerRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "owner")} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username">
                <Input
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="e.g. lahore_admin"
                />
              </Field>
              <Field label="Email Address">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. admin@lahore.com"
                />
              </Field>
            </div>

            <Field label="New Password (leave blank to keep current)">
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
              />
            </Field>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-ui-xs font-bold text-slate-500 uppercase mb-4">Team Information</h4>
              <div className="space-y-5">
                <Field label="Team Name">
                  <Input
                    value={form.team_name}
                    onChange={(e) => setForm((f) => ({ ...f, team_name: e.target.value }))}
                    placeholder="e.g. Lahore Qalandars"
                  />
                </Field>

                <Field label="Owner Name">
                  <Input
                    value={form.owner_name}
                    onChange={(e) => setForm((f) => ({ ...f, owner_name: e.target.value }))}
                    placeholder="e.g. Sameen Khan"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="City">
                    <Input
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      placeholder="e.g. Lahore"
                    />
                  </Field>

                  <Field label="Home Ground">
                    <Input
                      value={form.home_ground}
                      onChange={(e) => setForm((f) => ({ ...f, home_ground: e.target.value }))}
                      placeholder="e.g. Gaddafi Stadium"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              className="flex-1" 
              onClick={handleSave} 
              loading={loading}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Drawer>
    </DashboardLayout>
  );
}

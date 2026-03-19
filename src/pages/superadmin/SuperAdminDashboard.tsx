import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, Shield, Users, Package, ShoppingBag, DollarSign, Server, UserPlus, Pencil, Trash2, Eye, EyeOff, RefreshCw, LogOut, LayoutDashboard, Database, ChevronDown, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "/api";

interface Admin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface SystemInfo {
  nodeEnv: string;
  port: number;
  dbName: string;
  dbState: string;
  uptime: number;
  collections: { name: string; count: number }[];
}

const TABS = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "admins", icon: Shield, label: "Admin Management" },
  { id: "users", icon: Users, label: "User Management" },
  { id: "system", icon: Server, label: "System Control" },
];

const SuperAdminDashboard = () => {
  const { user, token, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => { authLogout(); navigate("/"); toast.info("Logged out."); };

  const apiFetch = useCallback(async (path: string, opts?: RequestInit) => {
    const res = await fetch(`${API_URL}/superadmin${path}`, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...opts?.headers },
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message);
    }
    return res.json();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex overflow-hidden font-sans text-white">
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 xl:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[75vw] max-w-60 bg-[#1a1a2e] border-r border-indigo-500/20 transform transition-transform duration-300 xl:relative xl:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-black text-white">SUPER ADMIN</span>
                <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Control Panel</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="xl:hidden p-1.5 text-indigo-300 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <nav className="flex-1 space-y-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (window.innerWidth < 1280) setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25" : "text-indigo-200/70 hover:bg-white/5 hover:text-white"}`}>
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="border-t border-indigo-500/20 pt-3 mt-3">
            <p className="text-[10px] text-indigo-400 truncate px-2 mb-2">{user?.email}</p>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 xl:h-16 bg-[#1a1a2e] border-b border-indigo-500/20 px-4 xl:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className={`xl:hidden p-2 text-indigo-300 hover:text-white ${sidebarOpen ? "hidden" : ""}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-base sm:text-lg font-bold text-white capitalize">{TABS.find(t => t.id === activeTab)?.label}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-indigo-300 font-bold">{user?.name}</span>
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black text-white">
              {user?.name?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeTab === "overview" && <OverviewTab apiFetch={apiFetch} />}
          {activeTab === "admins" && <AdminsTab apiFetch={apiFetch} />}
          {activeTab === "users" && <UsersTab apiFetch={apiFetch} />}
          {activeTab === "system" && <SystemTab apiFetch={apiFetch} />}
        </div>
      </main>
    </div>
  );
};

/* ── OVERVIEW TAB ── */
const OverviewTab = ({ apiFetch }: { apiFetch: (p: string, o?: RequestInit) => Promise<any> }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [system, setSystem] = useState<SystemInfo | null>(null);

  useEffect(() => {
    apiFetch("/stats").then(setStats).catch(() => {});
    apiFetch("/system").then(setSystem).catch(() => {});
  }, [apiFetch]);

  const cards = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500/20 text-blue-400" },
    { label: "Total Admins", value: stats.totalAdmins, icon: Shield, color: "bg-indigo-500/20 text-indigo-400" },
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-emerald-500/20 text-emerald-400" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-amber-500/20 text-amber-400" },
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-green-500/20 text-green-400" },
  ] : [];

  const formatUptime = (s: number) => {
    const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {!stats ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {cards.map(c => (
              <div key={c.label} className="bg-[#1a1a2e] rounded-2xl p-4 sm:p-5 border border-indigo-500/10">
                <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}><c.icon className="w-5 h-5" /></div>
                <p className="text-[10px] sm:text-xs font-bold text-indigo-300/60 uppercase tracking-widest mb-1">{c.label}</p>
                <p className="text-xl sm:text-2xl font-black text-white">{c.value}</p>
              </div>
            ))}
          </div>

          {system && (
            <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-indigo-500/10">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-indigo-400" /> System Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div><p className="text-indigo-300/60 font-bold uppercase tracking-wider mb-1">Environment</p><p className="font-black text-white">{system.nodeEnv}</p></div>
                <div><p className="text-indigo-300/60 font-bold uppercase tracking-wider mb-1">Database</p><p className={`font-black ${system.dbState === "connected" ? "text-green-400" : "text-red-400"}`}>{system.dbState}</p></div>
                <div><p className="text-indigo-300/60 font-bold uppercase tracking-wider mb-1">Uptime</p><p className="font-black text-white">{formatUptime(system.uptime)}</p></div>
                <div><p className="text-indigo-300/60 font-bold uppercase tracking-wider mb-1">DB Name</p><p className="font-black text-white">{system.dbName}</p></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── ADMINS TAB ── */
const AdminsTab = ({ apiFetch }: { apiFetch: (p: string, o?: RequestInit) => Promise<any> }) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/admins").then(setAdmins).catch(() => {}).finally(() => setLoading(false));
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: "", email: "", password: "", phone: "" }); setShowPw(false); setShowModal(true); };
  const openEdit = (a: Admin) => { setEditing(a); setForm({ name: a.name, email: a.email, password: "", phone: a.phone || "" }); setShowPw(false); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error("Name and email required");
    if (!editing && !form.password) return toast.error("Password required for new admin");
    setSaving(true);
    try {
      if (editing) {
        const body: any = { name: form.name, email: form.email, phone: form.phone };
        if (form.password) body.password = form.password;
        await apiFetch(`/admins/${editing._id}`, { method: "PUT", body: JSON.stringify(body) });
        toast.success("Admin updated");
      } else {
        await apiFetch("/admins", { method: "POST", body: JSON.stringify(form) });
        toast.success("Admin created");
      }
      setShowModal(false);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete admin "${name}"?`)) return;
    try { await apiFetch(`/admins/${id}`, { method: "DELETE" }); toast.success("Deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-indigo-300/60">{admins.length} admin(s)</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all">
          <UserPlus className="w-4 h-4" /> Create Admin
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="bg-[#1a1a2e] rounded-2xl border border-indigo-500/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-indigo-500/10 text-indigo-300/60 uppercase tracking-wider">
                <th className="text-left p-4 font-bold">Name</th>
                <th className="text-left p-4 font-bold">Email</th>
                <th className="text-left p-4 font-bold hidden sm:table-cell">Phone</th>
                <th className="text-left p-4 font-bold hidden md:table-cell">Created</th>
                <th className="text-right p-4 font-bold">Actions</th>
              </tr></thead>
              <tbody>
                {admins.map(a => (
                  <tr key={a._id} className="border-b border-indigo-500/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white">{a.name}</td>
                    <td className="p-4 text-indigo-200">{a.email}</td>
                    <td className="p-4 text-indigo-200/60 hidden sm:table-cell">{a.phone || "—"}</td>
                    <td className="p-4 text-indigo-200/60 hidden md:table-cell">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-indigo-500/20 text-indigo-300 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(a._id, a.name)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-indigo-300/40">No admin accounts</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-[#1a1a2e] w-full max-w-md rounded-2xl border border-indigo-500/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-indigo-500/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{editing ? "Edit Admin" : "Create Admin"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-white/10 text-indigo-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 block">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-indigo-300/30 outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="Admin name" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 block">Email *</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" className="w-full bg-white/5 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-indigo-300/30 outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="admin@example.com" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 block">Password {editing ? "(leave blank to keep)" : "*"}</label>
                <div className="relative">
                  <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type={showPw ? "text" : "password"} className="w-full bg-white/5 border border-indigo-500/20 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-indigo-300/30 outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="Password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 block">Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-white/5 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-indigo-300/30 outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="Phone number" />
              </div>
            </div>
            <div className="p-5 border-t border-indigo-500/10 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-xs font-bold text-indigo-300 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-black text-white transition-colors disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── USERS TAB ── */
const UsersTab = ({ apiFetch }: { apiFetch: (p: string, o?: RequestInit) => Promise<any> }) => {
  const [users, setUsers] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/users").then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (id: string, role: string) => {
    try { await apiFetch(`/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }); toast.success("Role updated"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    try { await apiFetch(`/admins/${id}`, { method: "DELETE" }); toast.success("Deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = { admin: "bg-indigo-500/20 text-indigo-300", customer: "bg-emerald-500/20 text-emerald-300" };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${colors[role] || "bg-white/10 text-white"}`}>{role}</span>;
  };

  return (
    <div>
      <p className="text-xs text-indigo-300/60 mb-5">{users.length} user(s)</p>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="bg-[#1a1a2e] rounded-2xl border border-indigo-500/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-indigo-500/10 text-indigo-300/60 uppercase tracking-wider">
                <th className="text-left p-4 font-bold">Name</th>
                <th className="text-left p-4 font-bold">Email</th>
                <th className="text-left p-4 font-bold hidden sm:table-cell">Phone</th>
                <th className="text-left p-4 font-bold">Role</th>
                <th className="text-left p-4 font-bold hidden md:table-cell">Joined</th>
                <th className="text-right p-4 font-bold">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-indigo-500/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white">{u.name}</td>
                    <td className="p-4 text-indigo-200">{u.email}</td>
                    <td className="p-4 text-indigo-200/60 hidden sm:table-cell">{u.phone || "—"}</td>
                    <td className="p-4">
                      <div className="relative inline-block">
                        <select value={u.role} onChange={e => changeRole(u._id, e.target.value)}
                          className="appearance-none bg-transparent border border-indigo-500/20 rounded-lg px-3 py-1.5 pr-7 text-[10px] font-bold text-white outline-none cursor-pointer hover:border-indigo-500/40">
                          <option value="customer" className="bg-[#1a1a2e]">Customer</option>
                          <option value="admin" className="bg-[#1a1a2e]">Admin</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="p-4 text-indigo-200/60 hidden md:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => deleteUser(u._id, u.name)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-indigo-300/40">No users</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── SYSTEM TAB ── */
const SystemTab = ({ apiFetch }: { apiFetch: (p: string, o?: RequestInit) => Promise<any> }) => {
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/system").then(setSystem).catch(() => {}).finally(() => setLoading(false));
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const seedAdmin = async () => {
    setSeeding(true);
    try {
      const res = await apiFetch("/seed-admin", { method: "POST" });
      toast.success(res.message);
    } catch (e: any) { toast.error(e.message); }
    finally { setSeeding(false); }
  };

  const formatUptime = (s: number) => {
    const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m ${s % 60}s`;
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  if (!system) return <p className="text-indigo-300/40 text-center py-10">Failed to load system info</p>;

  return (
    <div className="space-y-6">
      {/* Environment */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-indigo-500/10">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-indigo-400" /> Environment</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div><p className="text-indigo-300/60 font-bold uppercase tracking-wider mb-1">NODE_ENV</p><p className="font-black text-white">{system.nodeEnv}</p></div>
          <div><p className="text-indigo-300/60 font-bold uppercase tracking-wider mb-1">PORT</p><p className="font-black text-white">{system.port}</p></div>
          <div><p className="text-indigo-300/60 font-bold uppercase tracking-wider mb-1">DB Name</p><p className="font-black text-white">{system.dbName}</p></div>
          <div><p className="text-indigo-300/60 font-bold uppercase tracking-wider mb-1">DB Status</p><p className={`font-black ${system.dbState === "connected" ? "text-green-400" : "text-red-400"}`}>{system.dbState}</p></div>
        </div>
      </div>

      {/* Uptime */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-indigo-500/10">
        <h3 className="text-sm font-bold text-white mb-2">Server Uptime</h3>
        <p className="text-2xl font-black text-indigo-300">{formatUptime(system.uptime)}</p>
      </div>

      {/* Collections */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-indigo-500/10">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-indigo-400" /> MongoDB Collections</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {system.collections.map(c => (
            <div key={c.name} className="bg-white/[0.03] rounded-xl p-3 border border-indigo-500/5">
              <p className="text-[10px] text-indigo-300/60 font-bold uppercase tracking-wider truncate mb-1">{c.name}</p>
              <p className="text-lg font-black text-white">{c.count.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-[#1a1a2e] rounded-2xl p-5 border border-indigo-500/10">
        <h3 className="text-sm font-bold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={seedAdmin} disabled={seeding} className="flex items-center gap-2 px-5 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`} /> {seeding ? "Seeding..." : "Re-seed Default Admin"}
          </button>
          <button onClick={load} className="flex items-center gap-2 px-5 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh System Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

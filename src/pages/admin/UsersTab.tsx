import { useState, useEffect, useMemo } from "react";
import { Users, Search, Shield, UserCheck, UserX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "/api";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const UsersTab = () => {
  const { token, logout } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { toast.error("Session expired"); logout(); return; }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (userId: string, currentActive: boolean) => {
    setToggling(userId);
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update");
      }
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentActive } : u));
      toast.success(`User ${!currentActive ? "activated" : "deactivated"}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
    } finally {
      setToggling(null);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const customers = filtered.filter(u => u.role === "customer");
  const admins = filtered.filter(u => u.role === "admin");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1a1f36]">Users</h2>
            <p className="text-xs text-[#7a869a]">{customers.length} registered users</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9]" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-white border-[#eaedf3]"
          />
        </div>
      </div>

      {/* Admins */}
      {admins.length > 0 && (
        <Card className="border-[#eaedf3] shadow-sm overflow-hidden">
          <div className="bg-violet-50 px-4 py-2.5 border-b border-[#eaedf3] flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-bold text-violet-700">Administrators ({admins.length})</span>
          </div>
          <div className="divide-y divide-[#eaedf3]">
            {admins.map(user => (
              <div key={user._id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1f36]">{user.name}</p>
                    <p className="text-[10px] text-[#7a869a]">{user.email}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-700 border-0">Admin</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Customers */}
      <Card className="border-[#eaedf3] shadow-sm overflow-hidden">
        <div className="bg-blue-50 px-4 py-2.5 border-b border-[#eaedf3] flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-blue-700">Customers ({customers.length})</span>
        </div>
        {customers.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#7a869a]">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8f9fc] text-[10px] font-bold text-[#7a869a] uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5">User</th>
                  <th className="text-left px-4 py-2.5 hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-2.5 hidden md:table-cell">Joined</th>
                  <th className="text-center px-4 py-2.5">Status</th>
                  <th className="text-center px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedf3]">
                {customers.map(user => (
                  <tr key={user._id} className="hover:bg-[#f8f9fc] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1a1f36]">{user.name}</p>
                          <p className="text-[10px] text-[#7a869a]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4f566b] hidden sm:table-cell">{user.phone || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#7a869a] hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] border-0 ${user.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {user.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(user._id, user.isActive !== false)}
                        disabled={toggling === user._id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          user.isActive !== false
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        } disabled:opacity-50`}
                      >
                        {toggling === user._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : user.isActive !== false ? (
                          <><UserX className="w-3 h-3" /> Deactivate</>
                        ) : (
                          <><UserCheck className="w-3 h-3" /> Activate</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UsersTab;

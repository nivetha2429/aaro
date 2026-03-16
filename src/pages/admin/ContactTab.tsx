import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { toast } from "sonner";
import { Plus, Trash2, Save, MapPin, Phone, Mail, MessageCircle, Instagram, ChevronDown, ChevronUp } from "lucide-react";
import type { Branch, ContactSettings } from "@/data/products";

const emptyBranch: Branch = { name: "", address: "", phone: "", whatsapp: "", hours: "", closed: "", mapUrl: "" };

const ContactTab = () => {
    const { contactSettings, updateContactSettings } = useData();
    const [form, setForm] = useState({
        phone: "",
        email: "",
        address: "",
        whatsappNumber: "",
        instagramUrl: "",
        instagramHandle: "",
        whatsappGroupLink: "",
    });
    const [branches, setBranches] = useState<Branch[]>([]);
    const [saving, setSaving] = useState(false);
    const [expandedBranch, setExpandedBranch] = useState<number | null>(null);

    useEffect(() => {
        if (contactSettings) {
            const { branches: b, ...general } = contactSettings;
            setForm({
                phone: general.phone || "",
                email: general.email || "",
                address: general.address || "",
                whatsappNumber: general.whatsappNumber || "",
                instagramUrl: general.instagramUrl || "",
                instagramHandle: general.instagramHandle || "",
                whatsappGroupLink: general.whatsappGroupLink || "",
            });
            setBranches(b || []);
        }
    }, [contactSettings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateContactSettings({ ...form, branches } as ContactSettings);
            toast.success("Contact settings saved!");
        } catch (err: any) {
            toast.error(err.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const updateBranch = (index: number, field: keyof Branch, value: string) => {
        setBranches(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
    };

    const addBranch = () => {
        setBranches(prev => [...prev, { ...emptyBranch }]);
        setExpandedBranch(branches.length);
    };

    const removeBranch = (index: number) => {
        setBranches(prev => prev.filter((_, i) => i !== index));
        setExpandedBranch(null);
    };

    const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium";
    const labelClass = "text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block";

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900">Contact Settings</h2>
                    <p className="text-xs text-gray-500 mt-1">Manage contact info displayed across the website</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save All"}
                </button>
            </div>

            {/* General Contact Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
                <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" /> General Contact Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Display Phone</label>
                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 70942 23143" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="aarosystems.s@gmail.com" className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelClass}>Address</label>
                        <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Karur, India" className={inputClass} />
                    </div>
                </div>
            </div>

            {/* Social & WhatsApp */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
                <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600" /> Social & WhatsApp
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>WhatsApp Number</label>
                        <input value={form.whatsappNumber} onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))} placeholder="917094223143" className={inputClass} />
                        <p className="text-[10px] text-gray-400 mt-1">Include country code, no spaces</p>
                    </div>
                    <div>
                        <label className={labelClass}>WhatsApp Group Link</label>
                        <input value={form.whatsappGroupLink} onChange={e => setForm(f => ({ ...f, whatsappGroupLink: e.target.value }))} placeholder="https://chat.whatsapp.com/..." className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Instagram URL</label>
                        <input value={form.instagramUrl} onChange={e => setForm(f => ({ ...f, instagramUrl: e.target.value }))} placeholder="https://instagram.com/aarosystems" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Instagram Handle</label>
                        <input value={form.instagramHandle} onChange={e => setForm(f => ({ ...f, instagramHandle: e.target.value }))} placeholder="@aarosystems" className={inputClass} />
                    </div>
                </div>
            </div>

            {/* Branches */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Store Branches ({branches.length})
                    </h3>
                    <button onClick={addBranch} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                        <Plus className="w-4 h-4" /> Add Branch
                    </button>
                </div>

                {branches.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">No branches added yet. Click "Add Branch" to get started.</p>
                )}

                <div className="space-y-3">
                    {branches.map((branch, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setExpandedBranch(expandedBranch === i ? null : i)}
                                className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors text-left"
                            >
                                <span className="text-sm font-bold text-gray-800">{branch.name || `Branch ${i + 1}`}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeBranch(i); }}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    {expandedBranch === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </div>
                            </button>

                            {expandedBranch === i && (
                                <div className="px-3.5 pb-4 space-y-3 border-t border-gray-50">
                                    <div className="pt-3">
                                        <label className={labelClass}>Branch Name</label>
                                        <input value={branch.name} onChange={e => updateBranch(i, "name", e.target.value)} placeholder="AARO Systems — Karur Main" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Address</label>
                                        <input value={branch.address} onChange={e => updateBranch(i, "address", e.target.value)} placeholder="123, Jawahar Bazaar..." className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Phone</label>
                                            <input value={branch.phone} onChange={e => updateBranch(i, "phone", e.target.value)} placeholder="+91 86680 54205" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>WhatsApp</label>
                                            <input value={branch.whatsapp} onChange={e => updateBranch(i, "whatsapp", e.target.value)} placeholder="917094223143" className={inputClass} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Business Hours</label>
                                            <input value={branch.hours} onChange={e => updateBranch(i, "hours", e.target.value)} placeholder="Mon – Sat: 10 AM – 8 PM" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Closed On</label>
                                            <input value={branch.closed} onChange={e => updateBranch(i, "closed", e.target.value)} placeholder="Sunday: Closed" className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Google Maps URL</label>
                                        <input value={branch.mapUrl} onChange={e => updateBranch(i, "mapUrl", e.target.value)} placeholder="https://maps.google.com/?q=..." className={inputClass} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Save */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save All Changes"}
                </button>
            </div>
        </div>
    );
};

export default ContactTab;

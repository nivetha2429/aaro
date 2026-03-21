import { useState } from "react";
import { useData } from "@/context/DataContext";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import logoFallback from "@/assets/logo.png";

const ProfileTab = () => {
  const { contactSettings, updateContactSettings } = useData();
  const [logoUrl, setLogoUrl] = useState(contactSettings.logoUrl || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContactSettings({ ...contactSettings, logoUrl });
      // Persist to localStorage so favicon/loader update immediately without reload
      if (logoUrl) {
        localStorage.setItem("aaro_logo", logoUrl);
      } else {
        localStorage.removeItem("aaro_logo");
      }
      toast.success("Logo saved!");
    } catch {
      toast.error("Failed to save logo");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await updateContactSettings({ ...contactSettings, logoUrl: "" });
      localStorage.removeItem("aaro_logo");
      setLogoUrl("");
      toast.success("Logo removed — using default");
    } catch {
      toast.error("Failed to remove logo");
    } finally {
      setSaving(false);
    }
  };

  const currentLogo = logoUrl || logoFallback;

  return (
    <div className="max-w-lg space-y-6">
      <div className="bg-white rounded-2xl border border-[#eaedf3] p-6 shadow-sm">
        <h3 className="text-sm font-black text-[#1a1f36] uppercase tracking-widest mb-5">Site Logo</h3>

        {/* Preview */}
        <div className="flex items-center justify-center bg-[#f8f9fc] rounded-xl border border-[#eaedf3] p-6 mb-5">
          <img
            src={currentLogo}
            alt="Site logo preview"
            className="max-h-24 max-w-[240px] object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = logoFallback; }}
          />
        </div>

        {/* Upload */}
        <div className="mb-5">
          <p className="text-xs text-[#4f566b] font-medium mb-2">Upload new logo (PNG/JPG/SVG recommended)</p>
          <ImageUpload
            value={logoUrl}
            onChange={(url) => setLogoUrl(url)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !logoUrl}
            className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-black hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Logo"}
          </button>
          {contactSettings.logoUrl && (
            <button
              onClick={handleRemove}
              disabled={saving}
              className="px-4 rounded-xl border border-destructive/30 text-destructive text-sm font-bold hover:bg-destructive/5 transition-all disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>

        <p className="text-[11px] text-[#8792a2] mt-3">
          Logo appears in the navbar, footer, and browser tab favicon. Changes take effect immediately.
        </p>
      </div>
    </div>
  );
};

export default ProfileTab;

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export const ImageUpload = ({ value, onChange, label, className = "" }: ImageUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
        if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            const token = sessionStorage.getItem("aaro_token");
            const res = await fetch(`${API_URL}/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error((await res.json()).message);
            const { url } = await res.json();
            onChange(url);
            toast.success("Image uploaded!");
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">{label}</label>
            )}
            <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer group
          ${value ? "border-primary/40 bg-primary/5" : "border-[#eaedf3] hover:border-primary/40 hover:bg-primary/5"}`}
                onClick={() => !uploading && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                />

                {value ? (
                    /* Preview */
                    <div className="relative">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-2xl"
                            onError={e => { (e.target as HTMLImageElement).src = ""; onChange(""); }}
                        />
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onChange(""); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold text-center py-1.5 px-3 rounded-xl">
                                Click to change image
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Upload area */
                    <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
                        {uploading ? (
                            <><Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-xs font-bold text-primary">Uploading...</p></>
                        ) : (
                            <><div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                                <p className="text-sm font-bold text-[#1a1f36]">Click to upload</p>
                                <p className="text-[10px] text-[#7a869a]">or drag & drop • PNG, JPG, WEBP • Max 5MB</p></>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Multi-image uploader (up to 4 slots)
interface MultiImageUploadProps {
    values: string[];
    onChange: (urls: string[]) => void;
    label?: string;
    max?: number;
}

export const MultiImageUpload = ({ values, onChange, label, max = 4 }: MultiImageUploadProps) => {
    const slots = Array.from({ length: max }, (_, i) => values[i] || "");

    const handleChange = (index: number, url: string) => {
        const next = [...slots];
        next[index] = url;
        onChange(next.filter(Boolean));
    };

    return (
        <div className="space-y-3">
            {label && <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">{label}</label>}
            <div className="grid grid-cols-2 gap-3">
                {slots.map((val, i) => (
                    <ImageUpload
                        key={i}
                        value={val}
                        onChange={url => handleChange(i, url)}
                        label={`Image ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export const VideoUpload = ({ value, onChange, label, className = "" }: ImageUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("video/")) return toast.error("Please select a video file");
        if (file.size > 50 * 1024 * 1024) return toast.error("Video must be under 50MB");

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file); // Reusing the same multer field
            const token = sessionStorage.getItem("aaro_token");
            const res = await fetch(`${API_URL}/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error((await res.json()).message);
            const { url } = await res.json();
            onChange(url);
            toast.success("Video uploaded!");
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="text-[10px] font-black uppercase text-[#7a869a] tracking-widest">{label}</label>
            )}
            <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer group
          ${value ? "border-primary/40 bg-primary/5" : "border-[#eaedf3] hover:border-primary/40 hover:bg-primary/5"}`}
                onClick={() => !uploading && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                />

                {value ? (
                    <div className="relative">
                        <video
                            src={value}
                            className="w-full h-40 object-cover rounded-2xl"
                            controls
                        />
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onChange(""); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
                        {uploading ? (
                            <><Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-xs font-bold text-primary">Uploading...</p></>
                        ) : (
                            <><div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                                <p className="text-sm font-bold text-[#1a1f36]">Click to upload video</p>
                                <p className="text-[10px] text-[#7a869a]">or drag & drop • MP4, WEBM • Max 50MB</p></>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

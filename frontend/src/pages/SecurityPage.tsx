import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Key,
  X,
  ArrowLeft,
  CheckCircle2,
  Shield,
  AlertTriangle,
  Fingerprint,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function SecurityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.currentPassword) {
      tempErrors.currentPassword = "Current password is required";
    }
    if (!formData.newPassword) {
      tempErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 12) {
      tempErrors.newPassword = "Password must be at least 12 characters";
    } else if (!/[A-Z]/.test(formData.newPassword) || !/[a-z]/.test(formData.newPassword)) {
      tempErrors.newPassword = "Must combine uppercase & lowercase";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
      tempErrors.newPassword = "Must include a special character";
    }
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = "Confirm password is required";
    } else if (formData.newPassword !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast({
        title: "Registry Calibrated",
        description: "Authentication key updated successfully.",
      });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || error.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-24 pb-20 px-4 md:px-8 lg:px-16 xl:px-24">
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none opacity-[0.03]">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#B87333] rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12 md:mb-16">
          <button
            onClick={() => navigate("/profile")}
            className="group inline-flex items-center gap-2 text-[10px] font-label uppercase tracking-[0.2em] text-[#B87333] hover:text-black transition-all duration-300 mb-8"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl text-black tracking-tight leading-none">
                Forgot <span className="text-[#B87333] italic">Password</span>
              </h1>
              <p className="font-body text-black/70 text-base md:text-lg max-w-2xl leading-relaxed">
                No worries update your credentials quickly and keep your account protected.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">
          <div className="lg:col-span-12 xl:col-span-8">
            <div className="bg-white border border-[#F0F0F0] rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck size={120} className="text-black" />
              </div>

              <form onSubmit={handleUpdate} noValidate className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#B87333]/10 flex items-center justify-center text-[#B87333]">
                        <Lock size={14} />
                      </div>
                      <h3 className="font-label text-xs uppercase tracking-widest font-bold">Password Settings</h3>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[11px] font-label uppercase tracking-widest text-[#B87333] font-bold ml-1">
                        Current Password
                      </label>
                      <div className="relative group">
                        <input
                          type={showCurrent ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentPassword: e.target.value,
                            });
                            if (errors.currentPassword) {
                              setErrors((prev) => ({ ...prev, currentPassword: "" }));
                            }
                          }}
                          className={cn(
                            "w-full bg-[#FBFBFB] border px-7 py-5 rounded-2xl text-sm focus:outline-none transition-all font-body tracking-wider",
                            errors.currentPassword
                              ? "border-rose-500 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/5"
                              : "border-[#EEEEEE] focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/5"
                          )}
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-[#B87333] transition-colors"
                        >
                          {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[11px] font-label uppercase tracking-widest text-[#B87333] font-bold ml-1">
                      New Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showNew ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            newPassword: e.target.value,
                          });
                          if (errors.newPassword) {
                            setErrors((prev) => ({ ...prev, newPassword: "" }));
                          }
                        }}
                        className={cn(
                          "w-full bg-[#FBFBFB] border px-7 py-5 rounded-2xl text-sm focus:outline-none transition-all font-body tracking-wider",
                          errors.newPassword
                            ? "border-rose-500 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/5"
                            : "border-[#EEEEEE] focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/5"
                        )}
                        placeholder="Create new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-[#B87333] transition-colors"
                      >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[11px] font-label uppercase tracking-widest text-[#B87333] font-bold ml-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        });
                        if (errors.confirmPassword) {
                          setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }
                      }}
                      className={cn(
                        "w-full bg-[#FBFBFB] border px-7 py-5 rounded-2xl text-sm focus:outline-none transition-all font-body tracking-wider",
                        errors.confirmPassword
                          ? "border-rose-500 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/5"
                          : "border-[#EEEEEE] focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/5"
                      )}
                      placeholder="Repeat new password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto min-w-[240px] bg-black text-white px-10 py-5 rounded-full font-label text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#B87333] active:scale-95 transition-all shadow-xl shadow-black/5 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? "Modulating..." : "Update Password"}
                    {!loading && <Key size={14} />}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-4 space-y-8">
            <div className="bg-[#B87333]/[0.03] border border-[#B87333]/10 rounded-[40px] p-8 md:p-10 space-y-8">
              <div className="space-y-2">
                <Shield className="text-[#B87333] mb-4" size={32} />
                <h4 className="font-headline text-2xl text-black">Security Tips</h4>
                <p className="font-body text-sm text-gray-700 leading-relaxed font-medium">
                  A strong security protocol protects your personal refinery.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: CheckCircle2, text: "Minimum 12 characters" },
                  { icon: CheckCircle2, text: "Combine uppercase & lowercase" },
                  { icon: Fingerprint, text: "Include special characters" },
                  { icon: AlertTriangle, text: "Avoid common patterns" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <item.icon size={16} className="text-[#B87333] mt-1 shrink-0" />
                    <span className="font-label text-[11px] uppercase tracking-wider text-black/70 group-hover:text-[#B87333] transition-colors">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

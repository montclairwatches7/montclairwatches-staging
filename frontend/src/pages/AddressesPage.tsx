import { useState, useEffect } from "react"; // Synced
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Trash2,
  Home,
  ArrowLeft,
  CheckCircle2,
  Navigation,
  MapPin,
  X,
  Edit3,
  Save,
  Phone,
  User,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function AddressesPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCheckout = location.state?.from === "checkout";
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    street: "",
    city: "",
    zip_code: "",
    phone: "",
    is_default: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/auth/addresses");
      setAddresses(data);
    } catch (error) {
      console.error("Failed to fetch addresses");
    }
  };

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) tempErrors.full_name = "Receiver's name is required";
    if (!formData.phone.trim()) {
      tempErrors.phone = "Contact number is required";
    } else if (!/^\+?[0-9\s-]{8,20}$/.test(formData.phone.trim())) {
      tempErrors.phone = "Invalid contact number format (8-20 digits)";
    }
    if (!formData.street.trim()) tempErrors.street = "Street address is required";
    if (!formData.city.trim()) tempErrors.city = "City is required";
    if (!formData.zip_code.trim()) tempErrors.zip_code = "PinCode is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/auth/addresses/${editingId}`, formData);
        toast({
          title: "Address Updated",
          description: "Your delivery address has been successfully modified.",
        });
      } else {
        await api.post("/auth/addresses", formData);
        toast({
          title: "Address Saved",
          description: "New delivery address has been added to your profile.",
        });
      }
      handleCloseForm();
      fetchAddresses();
      refreshUser();

      if (fromCheckout && !editingId) {
        navigate("/checkout");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addr: any) => {
    setEditingId(addr.id);
    setFormData({
      full_name: addr.full_name,
      street: addr.street,
      city: addr.city,
      zip_code: addr.zip || addr.zip_code || "",
      phone: addr.phone,
      is_default: addr.is_default,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      full_name: "",
      street: "",
      city: "",
      zip_code: "",
      phone: "",
      is_default: false,
    });
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/auth/addresses/${id}`);
      toast({
        title: "Address Removed",
        description: "Delivery address has been deleted.",
      });
      fetchAddresses();
      refreshUser();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.put(`/auth/addresses/${id}/default`);
      toast({
        title: "Default Set",
        description: "This is now your primary delivery address.",
      });
      fetchAddresses();
      refreshUser();
    } catch (error: any) {
      console.error(error);
    }
  };

  if (loading && addresses.length === 0)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#B87333]/20 border-t-[#B87333] rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#B87333]">
            Loading your addresses...
          </p>
        </div>
      </div>
    );

  const inputClass =
    "w-full bg-[#F9F9F9] border border-[#EEEEEE] px-4 py-3 rounded-xl text-sm text-[#1A1714] placeholder-[#A0A0A0] focus:border-[#B87333] focus:ring-2 focus:ring-[#B87333]/5 outline-none transition-all duration-200";

  const labelClass = "block text-sm font-semibold text-[#666666] mb-2 ml-1";

  return (
    <div className="bg-[#FDFDFD] text-[#1A1714] pb-20">
      <div className="bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => fromCheckout ? navigate("/checkout") : navigate("/profile")}
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#666666] hover:text-[#B87333] transition-colors"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>
              <span className="hidden xs:inline">{fromCheckout ? "Back to Checkout" : "Back"}</span>
              <span className="inline xs:hidden">Back</span>
            </span>
          </button>

          <button
            onClick={() => (showForm ? handleCloseForm() : setShowForm(true))}
            className={cn(
              "relative group overflow-hidden px-4 xs:px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] xs:tracking-[0.2em] transition-all duration-500",
              showForm
                ? "bg-[#F5F5F5] text-[#666666] hover:bg-[#1A1714] hover:text-white"
                : "bg-[#1A1714] text-white hover:pr-8 active:scale-95",
            )}
          >
            <div className="relative z-10 flex items-center gap-2 xs:gap-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500",
                  showForm
                    ? "bg-[#666666]/10 text-inherit"
                    : "bg-[#B87333] text-white group-hover:scale-110",
                )}
              >
                {showForm ? (
                  <X size={12} />
                ) : (
                  <Plus size={12} strokeWidth={3} />
                )}
              </div>
              <span>
                <span className="hidden xs:inline">{showForm ? "Dismiss" : "Add New Location"}</span>
                <span className="inline xs:hidden">{showForm ? "Dismiss" : "Add Location"}</span>
              </span>
            </div>

            {!showForm && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500 text-white">
                <Navigation
                  size={12}
                  fill="currentColor"
                  className="rotate-45"
                />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-[#B87333] to-[#8B6240] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1714] leading-[1.1]">
            Manage <span className="text-[#B87333]">Addresses</span>
          </h1>
          <p className="mt-4 text-sm text-[#888888] font-medium max-w-lg leading-relaxed">
            Organize your delivery endpoints for a seamless luxury shopping
            experience across the globe.
          </p>
        </div>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
              className="absolute inset-0 bg-[#1A1714]/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={handleCloseForm}
            />

            <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
              <div className="p-5 xs:p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#B87333]/10 rounded-xl flex items-center justify-center">
                      {editingId ? (
                        <Edit3 size={20} className="text-[#B87333]" />
                      ) : (
                        <MapPin size={20} className="text-[#B87333]" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {editingId ? "Edit Address" : "Add Address"}
                      </h2>
                      <p className="text-xs text-[#888888] font-medium uppercase tracking-wider">
                        Delivery Address
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseForm}
                    className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] hover:bg-[#1A1714] hover:text-white transition-all duration-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={labelClass}>Receiver's Name</label>
                      <input
                        value={formData.full_name}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            full_name: e.target.value,
                          });
                          if (errors.full_name) {
                            setErrors((prev) => ({ ...prev, full_name: "" }));
                          }
                        }}
                        className={cn(inputClass, errors.full_name && "border-rose-500 bg-rose-50/10 focus:ring-rose-500/5")}
                        placeholder="Full Name"
                      />
                      {errors.full_name && (
                        <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                          {errors.full_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className={labelClass}>Contact Number</label>
                      <input
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errors.phone) {
                            setErrors((prev) => ({ ...prev, phone: "" }));
                          }
                        }}
                        className={cn(inputClass, errors.phone && "border-rose-500 bg-rose-50/10 focus:ring-rose-500/5")}
                        placeholder="+91 -- --- ----"
                      />
                      {errors.phone && (
                        <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className={labelClass}>Street Address</label>
                      <input
                        value={formData.street}
                        onChange={(e) => {
                          setFormData({ ...formData, street: e.target.value });
                          if (errors.street) {
                            setErrors((prev) => ({ ...prev, street: "" }));
                          }
                        }}
                        className={cn(inputClass, errors.street && "border-rose-500 bg-rose-50/10 focus:ring-rose-500/5")}
                        placeholder="Street, Building, Apartment"
                      />
                      {errors.street && (
                        <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                          {errors.street}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className={labelClass}>City</label>
                      <input
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value });
                          if (errors.city) {
                            setErrors((prev) => ({ ...prev, city: "" }));
                          }
                        }}
                        className={cn(inputClass, errors.city && "border-rose-500 bg-rose-50/10 focus:ring-rose-500/5")}
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className={labelClass}>PinCode</label>
                      <input
                        value={formData.zip_code}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            zip_code: e.target.value,
                          });
                          if (errors.zip_code) {
                            setErrors((prev) => ({ ...prev, zip_code: "" }));
                          }
                        }}
                        className={cn(inputClass, errors.zip_code && "border-rose-500 bg-rose-50/10 focus:ring-rose-500/5")}
                        placeholder="PinCode"
                      />
                      {errors.zip_code && (
                        <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                          {errors.zip_code}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-5 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.is_default}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_default: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-[#EEEEEE] text-[#B87333] focus:ring-[#B87333]/20 transition-all"
                      />
                      <span className="text-sm font-semibold text-[#666666] group-hover:text-[#1A1714] transition-colors">
                        Set as Default Delivery Address
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full h-[60px] bg-[#1A1714] text-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(184,115,51,0.3)] active:scale-[0.98] disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#B87333] to-[#8B6240] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">
                              Synchronizing...
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">
                              {editingId
                                ? "Update Address"
                                : "Save Address"}
                            </span>
                            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 group-hover:translate-x-1 transition-all duration-500">
                              <Navigation
                                size={12}
                                fill="currentColor"
                                className="rotate-45"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses && addresses.length > 0 ? (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className={cn(
                  "group relative bg-white border rounded-[32px] p-8 transition-all duration-500",
                  "hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] hover:-translate-y-1",
                  addr.is_default
                    ? "border-[#B87333] shadow-[0_12px_24px_-8px_rgba(184,115,51,0.1)] ring-1 ring-[#B87333]/5"
                    : "border-[#F0F0F0] hover:border-[#B87333]/20",
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500",
                      addr.is_default
                        ? "bg-[#B87333] text-white"
                        : "bg-[#F9F9F9] text-[#CCCCCC] group-hover:bg-[#B87333]/10 group-hover:text-[#B87333]",
                    )}
                  >
                    <Home size={22} strokeWidth={addr.is_default ? 2.5 : 2} />
                  </div>
                  {addr.is_default ? (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B87333] bg-[#B87333]/10 px-3 py-1 rounded-full">
                      Primary
                    </span>
                  ) : null}
                </div>

                <div className="space-y-4 mb-8 text-left">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B87333]">
                      Receiver
                    </p>
                    <h4
                      className="font-bold text-lg text-[#1A1714] leading-tight truncate"
                      title={addr.full_name}
                    >
                      {addr.full_name}
                    </h4>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B87333]">
                      Address
                    </p>
                    <p className="text-sm text-[#1A1714] font-medium leading-relaxed">
                      {addr.street}
                    </p>
                    <p className="text-xs text-[#888888] font-semibold">
                      {addr.city}, {addr.zip_code}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B87333]">
                      Contact
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1A1714]">
                      <Phone
                        size={14}
                        className="text-[#B87333]"
                        strokeWidth={2.5}
                      />
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-start gap-3 pt-6 border-t border-[#F9F9F9]">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] font-bold uppercase tracking-wider text-[#B87333] hover:underline decoration-2 underline-offset-4 transition-all"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(addr)}
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#666666] hover:text-[#1A1714] transition-all"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="ml-auto p-2.5 text-[#CCCCCC] hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 group/del"
                    title="Delete Address"
                  >
                    <Trash2
                      size={18}
                      className="transition-transform group-hover/del:scale-110"
                    />
                  </button>
                </div>
              </div>
            ))
          ) : !showForm ? (
            <div className="col-span-full border-2 border-dashed border-[#EEEEEE] rounded-[40px] p-8 sm:p-20 flex flex-col items-center text-center bg-white/50">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-[#F5F5F5]">
                <MapPin size={32} className="text-[#B87333]/30" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1714]">
                No saved addresses
              </h3>
              <p className="text-sm text-[#888888] mb-8 max-w-[280px]">
                Add your delivery locations for a faster checkout experience.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#1A1714] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#B87333] transition-all duration-300 shadow-xl shadow-black/10"
              >
                Add My First Address
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

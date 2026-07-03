import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import loginBg from "@/assets/luxury-watch-login.png";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = "Email Address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await adminLogin(email, password);
      toast({
        title: "Success",
        description: "Admin Login Successfully.",
      });
      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Fail",
        description: "Invalid Email or Password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 lg:p-8 font-body">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-neutral-100 flex flex-col lg:flex-row min-h-[600px] lg:h-[800px]">
        <div className="w-full lg:w-1/2 p-4 lg:p-6">
          <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden group">
            <div className="absolute inset-0 bg-black/10 z-10" />
            <img
              src={loginBg}
              alt="Luxury Watch"
              className="w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-110"
            />

            <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 lg:p-10">
              <div className="animate-fade-in">
                <h1 className="text-xl font-heading tracking-[0.5em] uppercase text-white drop-shadow-lg">
                  Montclair
                </h1>
              </div>

              <div
                className="animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >

                <p className="font-heading italic text-3xl lg:text-4xl text-white leading-tight mb-4 drop-shadow-md">
                  Crafting <span className="text-[#B87333]">Legacy</span>.
                </p>
                <p className="text-[10px] tracking-[0.4em] uppercase text-white/60 font-medium">
                  Admin Portal
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 py-12 bg-white">
          <div
            className="w-full max-w-[360px] mx-auto animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-white to-neutral-50 flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(184,115,51,0.15)] border border-[#B87333]/10 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-[#B87333]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Lock
                    size={16}
                    className="text-[#B87333] relative z-10 drop-shadow-[0_2px_4px_rgba(184,115,51,0.1)]"
                  />
                </div>
                <div className="h-px w-8 bg-neutral-100" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#B87333] font-bold">
                  Admin Portal
                </span>
              </div>
              <h2 className="font-heading text-4xl text-neutral-900 mb-3 tracking-tight">
                Admin Login
              </h2>

            </div>

            <form onSubmit={handleLogin} noValidate className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-bold ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    autoComplete="email"
                    placeholder="name@montclair.com"
                    className={`w-full bg-neutral-50 border rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 focus:bg-white placeholder:text-neutral-300 group-hover:border-neutral-200 ${errors.email
                      ? "border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/5"
                      : "border-neutral-100 focus:border-[#B87333] focus:ring-[#B87333]/5"
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-bold">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    autoComplete="current-password"
                    placeholder="Enter security key"
                    className={`w-full bg-neutral-50 border rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 focus:bg-white placeholder:text-neutral-300 group-hover:border-neutral-200 pr-12 ${errors.password
                      ? "border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/5"
                      : "border-neutral-100 focus:border-[#B87333] focus:ring-[#B87333]/5"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.password}</p>
                )}
              </div>



              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-[58px] bg-neutral-900 text-white rounded-xl text-[11px] tracking-[0.4em] uppercase overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-neutral-200 disabled:opacity-70"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span className="animate-pulse">Logging In</span>
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1.5 transition-transform duration-300"
                      />
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-[#B87333] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
              </button>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}

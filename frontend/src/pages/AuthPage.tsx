import { useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  CheckCircle2,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GoogleLogin } from "@react-oauth/google";
import loginBg from "@/assets/luxury-watch-login.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; otp?: string; newPassword?: string }>({});

  const { login, register, googleLogin, forgotPassword, verifyOTP, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const redirectTo = (location.state as any)?.redirectTo || "/";

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (isForgot) {
      if (forgotStep === 1) {
        if (!email.trim()) {
          newErrors.email = "Email ID is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          newErrors.email = "Please enter a valid email address";
        }
      } else if (forgotStep === 2) {
        if (!otp.trim()) {
          newErrors.otp = "Verification code is required";
        } else if (otp.trim().length !== 6) {
          newErrors.otp = "Verification code must be exactly 6 digits";
        }
      } else if (forgotStep === 3) {
        if (!newPassword.trim()) {
          newErrors.newPassword = "New password is required";
        } else if (newPassword.length < 6) {
          newErrors.newPassword = "Password must be at least 6 characters long";
        }
      }
    } else {
      if (!isLogin && !name.trim()) {
        newErrors.name = "User Name is required";
      }
      if (!email.trim()) {
        newErrors.email = "Email ID is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isForgot) {
        if (forgotStep === 1) {
          await forgotPassword(email);
          toast({
            title: "Verification Sent",
            description: "A secure code has been dispatched to your email.",
          });
          setForgotStep(2);
        } else if (forgotStep === 2) {
          await verifyOTP(email, otp);
          toast({
            title: "Code Verified",
            description: "You may now establish a new security key.",
          });
          setForgotStep(3);
        } else if (forgotStep === 3) {
          await resetPassword(email, otp, newPassword);
          toast({
            title: "Security Key Updated",
            description: "Your credentials have been successfully reset.",
          });
          setIsForgot(false);
          setForgotStep(1);
          setIsLogin(true);
          setOtp("");
          setNewPassword("");
        }
      } else if (isLogin) {
        await login(email, password);
        toast({
          title: "Authenticated",
          description: "Access granted to the Private Collection.",
        });
        navigate(redirectTo);
      } else {
        await register(name || email.split("@")[0], email, password);
        toast({
          title: "Access Requested",
          description: "Your account has been created.",
        });
        navigate(redirectTo);
      }
    } catch (error: any) {
      toast({
        title: "Process Failed",
        description: error.response?.data?.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-2 sm:p-4 lg:p-8 font-body">
      <div className="w-full max-w-6xl bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-neutral-100 flex flex-col lg:flex-row h-auto lg:min-h-[750px]">
        <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6 h-48 sm:h-64 lg:h-auto">
          <div className="relative w-full h-full rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden group">
            <div className="absolute inset-0 bg-black/10 z-10" />
            <img
              src={loginBg}
              alt="Luxury Watch"
              className="w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-110"
            />

            <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 xs:p-6 lg:p-10">
              <div className="animate-fade-in">
                <h1 className="text-sm sm:text-base lg:text-xl font-heading tracking-[0.5em] uppercase text-white drop-shadow-lg">
                  Montclair
                </h1>
              </div>

              <div
                className="animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                <div className="h-px w-6 sm:w-8 bg-[#B87333] mb-2 sm:mb-6" />
                <p className="font-heading italic text-xl sm:text-3xl lg:text-4xl text-white leading-tight mb-1 sm:mb-4 drop-shadow-md">
                  {isLogin ? (
                    <>
                      Mastering <span className="text-[#B87333]">Time</span>.
                    </>
                  ) : (
                    <>
                      Join the <span className="text-[#B87333]">Legacy</span>.
                    </>
                  )}
                </p>
                <p className="text-[8px] sm:text-[10px] tracking-[0.4em] uppercase text-white/60 font-medium">
                  Private Collection Access
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-24 py-10 sm:py-12 lg:py-16 bg-white">
          <div
            className="w-full max-w-[420px] mx-auto animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-white to-neutral-50 flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(184,115,51,0.15)] border border-[#B87333]/10 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-[#B87333]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {isLogin ? (
                    <Lock
                      size={14}
                      className="text-[#B87333] sm:w-[16px] sm:h-[16px] relative z-10 drop-shadow-[0_2px_4px_rgba(184,115,51,0.1)]"
                    />
                  ) : (
                    <UserPlus
                      size={14}
                      className="text-[#B87333] sm:w-[16px] sm:h-[16px] relative z-10 drop-shadow-[0_2px_4px_rgba(184,115,51,0.1)]"
                    />
                  )}
                </div>
                <div className="h-px w-6 sm:w-8 bg-neutral-100" />
                <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-[#B87333] font-bold">
                  {isForgot
                    ? "Recovery"
                    : isLogin
                      ? "User Login"
                      : "User Register"}
                </span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-neutral-900 mb-2 sm:mb-3 tracking-tight">
                {isForgot
                  ? "Security Key Recovery"
                  : isLogin
                    ? "Secure Login"
                    : "Secure Register"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                {isForgot
                  ? forgotStep === 1 
                    ? "Enter your email to receive a secure recovery code."
                    : forgotStep === 2
                      ? "Enter the 6-digit code sent to your email."
                      : "Enter your new security key to regain access."
                  : isLogin
                    ? "Enter your Email and Password to access the exclusive collection."
                    : "Create an User account to start your luxury journey."}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {!isForgot && !isLogin && (
                <div className="space-y-2 animate-in fade-in duration-500">
                  <label className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-bold ml-1">
                    User Name
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Enter your full name"
                      className={`w-full bg-neutral-50 border rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 focus:bg-white placeholder:text-neutral-300 group-hover:border-neutral-200 ${
                        errors.name
                          ? "border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/5"
                          : "border-neutral-100 focus:border-[#B87333] focus:ring-[#B87333]/5"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.name}</p>
                  )}
                </div>
              )}

              {(!isForgot || forgotStep === 1) && (
                <div className="space-y-2">
                  <label className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-bold ml-1">
                    Email ID
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
                      placeholder="name@example.com"
                      disabled={isForgot && forgotStep > 1}
                      className={`w-full bg-neutral-50 border rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 focus:bg-white placeholder:text-neutral-300 group-hover:border-neutral-200 disabled:opacity-50 ${
                        errors.email
                          ? "border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/5"
                          : "border-neutral-100 focus:border-[#B87333] focus:ring-[#B87333]/5"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.email}</p>
                  )}
                </div>
              )}

              {isForgot && forgotStep === 2 && (
                <div className="space-y-2 animate-in fade-in duration-500">
                  <label className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-bold ml-1">
                    Verification Code
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setErrors((prev) => ({ ...prev, otp: undefined }));
                      }}
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      className={`w-full bg-neutral-50 border rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 focus:bg-white placeholder:text-neutral-300 group-hover:border-neutral-200 text-center tracking-[1em] font-bold ${
                        errors.otp
                          ? "border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/5"
                          : "border-neutral-100 focus:border-[#B87333] focus:ring-[#B87333]/5"
                      }`}
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1 text-center tracking-normal">{errors.otp}</p>
                  )}
                </div>
              )}

              {isForgot && forgotStep === 3 && (
                <div className="space-y-2 animate-in fade-in duration-500">
                  <label className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-bold ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, newPassword: undefined }));
                      }}
                      placeholder="••••••••••••"
                      className={`w-full bg-neutral-50 border rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 focus:bg-white placeholder:text-neutral-300 group-hover:border-neutral-200 pr-12 ${
                        errors.newPassword
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
                  {errors.newPassword && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.newPassword}</p>
                  )}
                </div>
              )}

              {!isForgot && (
                <div className="space-y-2 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-bold">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgot(true);
                          setErrors({});
                        }}
                        className="text-[9px] tracking-[0.1em] uppercase text-[#B87333] hover:underline font-bold"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      autoComplete={
                        isLogin ? "current-password" : "new-password"
                      }
                      placeholder="••••••••••••"
                      className={`w-full bg-neutral-50 border rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 focus:bg-white placeholder:text-neutral-300 group-hover:border-neutral-200 pr-12 ${
                        errors.password
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
              )}

              {isLogin && !isForgot && (
                <div className="flex items-center gap-3 py-1">
                  <label className="relative flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      defaultChecked
                    />
                    <div className="w-4 h-4 border border-neutral-200 rounded transition-all group-hover:border-[#B87333] peer-checked:bg-[#B87333] peer-checked:border-[#B87333]" />
                    <CheckCircle2
                      size={10}
                      className="absolute left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                    />
                    <span className="ml-3 text-[10px] tracking-[0.1em] uppercase text-neutral-400 font-medium group-hover:text-neutral-600 transition-colors">
                      Maintain Authentication
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-[54px] sm:h-[58px] bg-neutral-900 text-white rounded-xl text-[10px] sm:text-[11px] tracking-[0.3em] uppercase overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-neutral-200 disabled:opacity-70 mt-2"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      {isForgot
                        ? forgotStep === 1
                          ? "Send Code"
                          : forgotStep === 2
                            ? "Verify Code"
                            : "Reset Password"
                        : isLogin
                          ? "Login"
                          : "Create Profile"}
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

            <div className="relative my-10 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-neutral-200" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-medium shrink-0 px-2">
                or continue with
              </span>
              <div className="flex-1 h-[1px] bg-neutral-200" />
            </div>

            <div className="flex justify-center w-full max-w-full overflow-hidden">
              <div className="w-full max-w-[320px] sm:max-w-[380px]">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                      try {
                        setLoading(true);
                        await googleLogin(credentialResponse.credential);
                        toast({
                          title: "Authenticated",
                          description: "Access granted via social provider.",
                        });
                        navigate(redirectTo);
                      } catch {
                        toast({
                          title: "Authentication Failed",
                          variant: "destructive",
                        });
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  onError={() => {
                    toast({
                      title: "Provider Error",
                      variant: "destructive",
                    });
                  }}
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="350"
                />
              </div>
            </div>

            <div
              className="mt-12 pt-8 border-t border-neutral-50 text-center animate-fade-in"
              style={{ animationDelay: "600ms" }}
            >
              <p className="text-[11px] tracking-[0.1em] text-neutral-400">
                {isForgot ? (
                  <button
                    onClick={() => {
                      setIsForgot(false);
                      setForgotStep(1);
                      setIsLogin(true);
                      setOtp("");
                      setNewPassword("");
                      setErrors({});
                    }}
                    className="text-[#B87333] hover:text-[#A0632D] transition-colors font-bold uppercase tracking-[0.2em]"
                  >
                    Return to Portal
                  </button>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {isLogin
                      ? "Create a New Account"
                      : "Already have an account?"}
                    <button
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setErrors({});
                      }}
                      className="text-[#B87333] hover:text-[#A0632D] transition-colors font-bold uppercase tracking-[0.2em] ml-1"
                    >
                      {isLogin ? "Create New Profile" : "Sign In"}
                    </button>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

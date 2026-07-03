import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
} from "lucide-react";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const fieldCls = [
  "w-full",
  "bg-slate-600/50",
  "border border-slate-500",
  "rounded-xl",
  "px-4",
  "text-sm",
  "font-medium",
  "text-white",
  "placeholder:text-slate-400",
  "focus:outline-none",
  "focus:border-primary",
  "focus:ring-1 focus:ring-primary",
  "transition-all duration-200",
  "hover:border-slate-400",
].join(" ");

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = "Full name is required";
    if (!email.trim()) {
      tempErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      tempErrors.email = "Please enter a valid email address";
    }
    if (!message.trim()) tempErrors.message = "Message is required";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: "Inquiry Dispatched",
        description: "Your message has been received. Our concierge will contact you shortly.",
      });
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setErrors({});
    } catch (err) {
      toast({
        title: "Dispatch Failure",
        description: "Could not send inquiry at this moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 bg-background transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="mb-10 md:mb-14 text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black tracking-tighter text-foreground leading-tight">
            Contact <span className="text-primary italic">Us</span>
          </h1>

        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-heading font-bold tracking-tight text-foreground">
                Contact Us
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Have questions about our luxury timepieces or need support? Get in touch with our expert team or visit a boutique near you. We are always here to assist you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {[
                {
                  icon: MapPin,
                  title: "Address",
                  value: "410 rajhans tower , B/s krink tower mangarh chowk minibazar varachha Surat Gujrat",
                  sub: "Open Daily: 10AM - 8PM",
                },
                {
                  icon: Phone,
                  title: "Contact Number",
                  value: "+91 99253 47844",
                  sub: "Priority Support for Collectors",
                },
                {
                  icon: Mail,
                  title: "Mail Id",
                  value: "montclairwatches7@gmail.com",
                  sub: "Replies within 4 working hours",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5 rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/20 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-foreground font-bold text-sm mb-0.5">
                      {item.value}
                    </p>
                    <p className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden border border-border/50 shadow-sm">
              <div className="flex items-center justify-between px-4 py-2.5 bg-background border-b border-border/40">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">
                    Our Location
                  </span>
                </div>
              </div>

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1682.9841126520203!2d72.84949119839474!3d21.2113789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f04ee485bbd%3A0x8c8d7f9f46c01063!2sRajhans%20Tower!5e1!3m2!1sen!2sin!4v1782842864140!5m2!1sen!2sin"
                className="w-full h-56 sm:h-64 lg:h-56 border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>

              <div className="bg-background px-4 py-2 flex items-center gap-2 border-t border-border/40">
                <Clock size={11} className="text-muted-foreground shrink-0" />
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Mon – Sun · 10:00 AM – 8:00 PM
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center gap-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Follow Us on Social Media
              </p>
              <div className="flex gap-3">
                {[FaInstagram, FaTwitter, FaFacebook].map((Social, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
                  >
                    <Social size={15} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-7 md:p-10 rounded-3xl shadow-2xl shadow-slate-900/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

              <div className="relative z-10">
                <div className="mb-7">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                    Send a Message
                  </p>
                  <h3 className="text-xl md:text-2xl font-heading font-black tracking-tight text-white">
                    Inquiry Form
                  </h3>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Alexander Vance"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) {
                            setErrors((prev) => ({ ...prev, name: "" }));
                          }
                        }}
                        className={cn(fieldCls, "h-12", errors.name && "border-rose-500 bg-rose-950/20 focus:ring-rose-500")}
                      />
                      {errors.name && (
                        <p className="text-rose-400 text-[10px] font-bold mt-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="av@montclair.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) {
                            setErrors((prev) => ({ ...prev, email: "" }));
                          }
                        }}
                        className={cn(fieldCls, "h-12", errors.email && "border-rose-500 bg-rose-950/20 focus:ring-rose-500")}
                      />
                      {errors.email && (
                        <p className="text-rose-400 text-[10px] font-bold mt-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`${fieldCls} h-12`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                        Inquiry Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className={`${fieldCls} h-12 appearance-none cursor-pointer`}
                      >
                        <option
                          value=""
                          disabled
                          className="bg-slate-800 text-slate-400"
                        >
                          Select a subject…
                        </option>
                        <option
                          value="acquisition"
                          className="bg-slate-800 text-white"
                        >
                          General Acquisition
                        </option>
                        <option
                          value="fitting"
                          className="bg-slate-800 text-white"
                        >
                          Personalized Fitting
                        </option>
                        <option
                          value="appointment"
                          className="bg-slate-800 text-white"
                        >
                          Boutique Appointment
                        </option>
                        <option
                          value="service"
                          className="bg-slate-800 text-white"
                        >
                          Technical Service
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                      Detailed Message
                    </label>
                    <textarea
                      rows={5}
                      placeholder="How can we assist with your collection?"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) {
                          setErrors((prev) => ({ ...prev, message: "" }));
                        }
                      }}
                      className={cn(fieldCls, "py-3 resize-none min-h-[130px] md:min-h-[150px]", errors.message && "border-rose-500 bg-rose-950/20 focus:ring-rose-500")}
                    />
                    {errors.message && (
                      <p className="text-rose-400 text-[10px] font-bold mt-1 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    disabled={loading}
                    className="w-full h-12 md:h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase tracking-[0.25em] text-xs shadow-xl shadow-primary/25 transition-all active:scale-95 group flex items-center justify-center gap-2"
                  >
                    <Send
                      size={15}
                      className="mr-2.5 group-hover:translate-x-1.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                    {loading ? "Submitting..." : "Submit"}
                  </Button>


                </form>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 xs:grid-cols-3 gap-4">
              {[
                { label: "Response Time", value: "< 4 Hrs" },
                { label: "Global Boutiques", value: "12" },
                { label: "Collector Support", value: "24 / 7" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group text-center p-4 rounded-2xl border border-border/60 bg-white hover:border-[#B87333]/30 hover:shadow-lg hover:shadow-[#B87333]/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center items-center"
                >
                  <p className="text-base sm:text-lg md:text-xl font-black text-[#1A1714] group-hover:text-[#B87333] transition-colors duration-300">
                    {stat.value}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#888888] mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

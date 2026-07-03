import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
    ShieldAlert,
    Terminal,
    Lock,
    ScrollText,
    CheckCircle2,
    ChevronRight,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PrivacyPolicyPage() {
    const { data: page, isLoading } = useQuery({
        queryKey: ["page", "privacy"],
        queryFn: async () => {
            const response = await api.get("/pages");
            const privacyPage = response.data.data.find(
                (p: any) => p.slug === "privacy",
            );
            return privacyPage;
        },
    });

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-20 bg-background transition-colors duration-500">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    <aside className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000">
                        <div className="lg:sticky lg:top-32 space-y-8">
                            <div className="space-y-6">


                                <header>
                                    <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-foreground mb-4 leading-tight">
                                        {page?.title || "Privacy Policy"}
                                    </h1>
                                    <p className="text-muted-foreground text-[13px] font-light leading-relaxed max-w-xs">
                                        Learn how we protect your personal information and ensure a secure browsing experience.
                                    </p>
                                </header>

                                <div className="flex items-center gap-3 py-4 border-y border-border/50">
                                    <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            Version
                                        </span>
                                        <span className="text-xs font-black text-foreground uppercase tracking-wider">
                                            {page?.updated_at
                                                ? new Date(page.updated_at).toLocaleDateString(
                                                    "en-US",
                                                    { month: "short", day: "numeric", year: "numeric" },
                                                )
                                                : "v1.0.4"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <nav className="hidden lg:block space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mb-6">
                                    Policy Sections
                                </p>
                                {[
                                    "Information We Collect",
                                    "How We Use Data",
                                    "Data Protection",
                                    "Your Rights",
                                    "Third-Party Sharing",
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 group cursor-pointer transition-all border border-transparent hover:border-border/50"
                                    >
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                                            {item}
                                        </span>
                                        <ChevronRight
                                            size={14}
                                            className="text-muted-foreground/30 group-hover:text-primary transition-colors group-hover:translate-x-1"
                                        />
                                    </div>
                                ))}
                            </nav>

                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        Privacy Compliance
                                    </span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-muted-foreground/80 font-medium italic">
                                    "Fully compliant with GDPR and CCPA regulations to safeguard your personal data."
                                </p>
                            </div>
                        </div>
                    </aside>

                    <main className="lg:col-span-8 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        {isLoading ? (
                            <div className="space-y-6">
                                <div className="h-8 w-1/3 bg-secondary/50 rounded-lg animate-pulse" />
                                <div className="h-[600px] bg-secondary/20 rounded-[2.5rem] border border-border/50 animate-pulse" />
                            </div>
                        ) : page ? (
                            <div className="relative group">
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary/10 transition-colors duration-1000" />

                                <div className="bg-white dark:bg-neutral-900/50 p-4 sm:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-border shadow-2xl shadow-black/[0.02] backdrop-blur-xl overflow-hidden relative">
                                    <div className="flex items-center justify-between mb-12 pb-8 border-b border-border/50">
                                        <div className="flex items-center gap-3 opacity-40">
                                            <ScrollText size={18} />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                                                Privacy Policy
                                            </span>
                                        </div>

                                    </div>

                                    <article
                                        className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                                prose-headings:font-heading prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
                                prose-p:leading-relaxed prose-p:text-muted-foreground/90 prose-p:font-light 
                                prose-strong:text-foreground prose-strong:font-bold
                                prose-li:text-muted-foreground/90 prose-li:marker:text-primary
                                prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl
                                selection:bg-primary/20 selection:text-primary"
                                        dangerouslySetInnerHTML={{ __html: page.content }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/50 p-12 md:p-20 rounded-[3rem] text-center space-y-6">
                                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                                    <ShieldAlert className="text-rose-500" size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-rose-950 dark:text-rose-400 uppercase tracking-tighter">
                                        Failed to Load Policy
                                    </h2>
                                    <p className="text-rose-600/70 dark:text-rose-300/40 text-sm font-light italic max-w-xs mx-auto">
                                        We could not load the privacy policy content. Please try again.
                                    </p>
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-10 py-3.5 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95 shadow-xl shadow-rose-500/20"
                                >
                                    Retry Loading
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

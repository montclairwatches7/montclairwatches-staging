import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Link } from "react-router-dom";
import {
  Calendar,
  ArrowRight,
  Tag,
  LayoutGrid,
  List,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await api.get("/posts");
      return response.data.data;
    },
  });

  const activePosts = posts?.filter((p: any) => p.status === "published") || [];

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 bg-background transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 md:mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  The Heritage Journal
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight text-foreground leading-[1.1]">
                Timeless <span className="text-primary italic">Stories</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base font-light leading-relaxed max-w-xl">
                Exploring the confluence of fine watchmaking, artisanal
                heritage, and contemporary luxury culture.
              </p>
            </div>

            <div className="flex items-center gap-2 p-1 bg-secondary/30 rounded-xl shrink-0 w-fit">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  viewMode === "grid"
                    ? "bg-white dark:bg-neutral-800 shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  viewMode === "list"
                    ? "bg-white dark:bg-neutral-800 shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-4">
                <div className="aspect-[4/3] bg-secondary/20 rounded-3xl animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-1/4 bg-secondary/20 rounded animate-pulse" />
                  <div className="h-6 w-full bg-secondary/20 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "transition-all duration-500",
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
                : "flex flex-col gap-6",
            )}
          >
            {activePosts.map((post: any, idx: number) => (
              <article
                key={post.id}
                className={cn(
                  "group relative bg-white dark:bg-neutral-900/40 rounded-[2rem] border border-border/40 overflow-hidden transition-all duration-500",
                  "hover:border-primary/20 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-primary/5",
                  viewMode === "list"
                    ? "md:flex md:items-stretch"
                    : "flex flex-col",
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className={cn(
                    "relative overflow-hidden block",
                    viewMode === "grid"
                      ? "aspect-[16/10]"
                      : "aspect-[16/10] md:aspect-auto md:w-[35%] lg:w-[25%] shrink-0",
                  )}
                >
                  <img
                    src={post.featured_image_url || "/placeholder-blog.jpg"}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 bg-white/80 backdrop-blur-md dark:bg-black/80 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </Link>

                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-primary/60 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>4 min</span>
                    </div>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="block mb-2 group/title"
                  >
                    <h3
                      className={cn(
                        "font-heading font-black text-foreground transition-colors duration-300 tracking-tight leading-tight line-clamp-2",
                        viewMode === "grid" ? "text-lg" : "text-xl md:text-2xl",
                      )}
                    >
                      {post.title}
                    </h3>
                  </Link>

                  <p
                    className={cn(
                      "text-muted-foreground font-light leading-relaxed mb-5 line-clamp-2",
                      viewMode === "grid" ? "text-[13px]" : "text-sm max-w-xl",
                    )}
                  >
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors group/link"
                    >
                      Read More
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>

                    <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                        <User size={10} />
                      </div>
                      <span className="text-[8px] font-bold uppercase">
                        Editorial
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {activePosts.length === 0 && !isLoading && (
          <div className="py-24 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-secondary/30 rounded-3xl flex items-center justify-center text-muted-foreground/30">
              <Tag size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">
                No Articles Found
              </h3>
              <p className="text-muted-foreground text-sm font-light">
                The archive is currently being updated. Please return shortly.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Sync Repository
            </button>
          </div>
        )}

        {activePosts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-border/40">
            <div className="flex items-center justify-center gap-4">
              <button className="group flex items-center gap-3 px-8 py-3.5 bg-[#b87333] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-[#a0632d] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft
                  size={14}
                  className="transition-transform group-hover:-translate-x-1"
                />
                Previous
              </button>

              <button className="group flex items-center gap-3 px-8 py-3.5 bg-[#b87333] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-[#a0632d] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                Next
                <ChevronRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

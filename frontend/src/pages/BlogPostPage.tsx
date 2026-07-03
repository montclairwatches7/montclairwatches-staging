import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  Share2,
  Bookmark,
  Clock,
  User,
} from "lucide-react";

export default function BlogPostPage() {
  const { slug } = useParams();

  const { data: serverResponse, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const response = await api.get("/posts");
      const post = response.data.data.find((p: any) => p.slug === slug);
      return post;
    },
  });

  const post = serverResponse;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 animate-pulse bg-slate-50/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="h-4 w-32 bg-slate-200 rounded-full mb-8" />
          <div className="h-10 w-3/4 bg-slate-200 rounded-lg mb-6" />
          <div className="flex gap-4 mb-10">
            <div className="h-4 w-24 bg-slate-200 rounded-full" />
            <div className="h-4 w-24 bg-slate-200 rounded-full" />
          </div>
          <div className="aspect-[16/9] bg-slate-200 rounded-3xl mb-12 shadow-sm" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Post not found
          </h2>
          <p className="text-slate-500 mb-6">
            The article you're looking for might have been moved or deleted.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Return to journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 bg-[#fcfcfd]">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 hover:text-primary transition-all mb-10 group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm border border-slate-100 group-hover:border-primary/20 transition-all">
            <ChevronLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </div>
          Back to Journal
        </Link>

        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary/10">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-300" />
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.2] mb-8">
            {post.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
              <User size={18} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Montclair Editorial
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Design & Strategy
              </p>
            </div>
          </div>
        </header>

        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-16 group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            src={post.featured_image_url || "/placeholder-blog.jpg"}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="relative">
          <div className="hidden xl:flex flex-col gap-3 absolute -left-24 top-0">
            <button className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all">
              <Share2 size={18} />
            </button>
            <button className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all">
              <Bookmark size={18} />
            </button>
          </div>

          <article
            className="prose prose-slate max-w-none 
            prose-headings:text-slate-900 prose-headings:font-extrabold prose-headings:tracking-tight
            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg
            prose-strong:text-slate-900 prose-strong:font-bold
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-4 prose-blockquote:border-primary/20 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic
            prose-img:rounded-[2rem] prose-img:shadow-xl"
          >
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        </div>

        <footer className="mt-20 p-8 md:p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl font-black text-slate-900 shadow-inner">
                  M
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                  Written By
                </p>
                <h4 className="font-extrabold text-xl text-slate-900">
                  Montclair Editorial
                </h4>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Curating stories about design, lifestyle, and modern
                  aesthetics.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-slate-900/10 active:scale-95">
                <Share2 size={14} />
                Share Article
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

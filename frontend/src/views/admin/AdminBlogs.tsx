import GenericAdminView from "./GenericAdminView";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminBlogs() {
  const columns = [
    {
      header: "Post Title",
      accessorKey: "title",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm truncate max-w-[300px]">{row.title}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">slug: {row.slug}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          row.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "created_at",
      cell: (row: any) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const formFields = [
    { name: "title", label: "Post Title", type: "text", required: true, placeholder: "Enter post title..." },
    { name: "slug", label: "URL Slug", type: "text", required: true, placeholder: "e.g. why-automatic-watches-matter" },
    { name: "category", label: "Category", type: "text", placeholder: "e.g. Heritage, Engineering, Lifestyle" },
    { name: "featured_image_url", label: "Featured Image URL", type: "text" },
    { name: "excerpt", label: "Excerpt (Short Summary)", type: "textarea", placeholder: "Briefly describe the post content..." },
    { name: "content", label: "Full Article Content", type: "richtext", required: true },
    {
      name: "status",
      label: "Publication Status",
      type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
    },
  ];

  return (
    <GenericAdminView
      moduleName="posts"
      title="Editorial Content"
      addButtonText="ADD NEW BLOGS"
      columns={columns as any}
      formFields={formFields as any}
      icon={FileText}
    />
  );
}

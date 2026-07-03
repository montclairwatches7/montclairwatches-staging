import GenericAdminView from "./GenericAdminView";
import { FileText } from "lucide-react";

export default function AdminPages() {
  const columns = [
    {
      header: "Title",
      accessorKey: "title",
      cell: (row: any) => (
        <span className="font-bold text-sm tracking-tight">{row.title}</span>
      ),
    },
    {
      header: "Slug",
      accessorKey: "slug",
      cell: (row: any) => (
        <code className="bg-secondary px-2 py-1 rounded text-[10px] text-primary">{row.slug}</code>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          row.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
        }`}>
          {row.status}
        </span>
      ),
    },
  ];

  const formFields = [
    { name: "title", label: "Page Title", type: "text", required: true },
    { name: "slug", label: "Slug (e.g. privacy, terms)", type: "text", required: true },
    { name: "content", label: "Page Content", type: "richtext", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ];

  return (
    <GenericAdminView
      moduleName="pages"
      title="Site Content Pages"
      addButtonText="ADD NEW PAGES"
      columns={columns as any}
      formFields={formFields as any}
      icon={FileText}
    />
  );
}

import GenericAdminView from "./GenericAdminView";
import { Image as ImageIcon } from "lucide-react";

export default function AdminBanners() {
  const columns = [
    {
      header: "Banner",
      accessorKey: "image_url",
      cell: (row: any) => (
        <div className="w-20 h-10 rounded-lg overflow-hidden border border-border bg-muted">
          <img src={row.image_url} alt={row.title} className="w-full h-full object-cover" />
        </div>
      ),
    },
    {
      header: "Title",
      accessorKey: "title",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm">{row.title}</span>
          <span className="text-[10px] text-muted-foreground uppercase">{row.subtitle?.substring(0, 30)}...</span>
        </div>
      ),
    },
    {
      header: "Order",
      accessorKey: "display_order",
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
    { name: "title", label: "Hero Title", type: "text", required: true },
    { name: "subtitle", label: "Hero Subtitle", type: "textarea" },
    { name: "image_url", label: "Desktop Image URL", type: "text", required: true },
    { name: "mobile_image_url", label: "Mobile Image URL", type: "text" },
    { name: "cta_1_text", label: "Primary CTA Text", type: "text" },
    { name: "cta_1_link", label: "Primary CTA Link", type: "text" },
    { name: "display_order", label: "Sequence Order", type: "number" },
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
      moduleName="banners"
      title="Promotional Banners"
      addButtonText="ADD NEW BANNER"
      columns={columns as any}
      formFields={formFields as any}
      icon={ImageIcon}
    />
  );
}

import GenericAdminView from "./GenericAdminView";
import { Quote, Star } from "lucide-react";

export default function AdminTestimonials() {
  const columns = [
    {
      header: "Client",
      accessorKey: "user_name",
      cell: (row: any) => <span className="font-bold">{row.user_name}</span>,
    },
    {
      header: "Rating",
      accessorKey: "rating",
      cell: (row: any) => (
         <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: row.rating }).map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
         </div>
      )
    },
    {
      header: "Verified",
      accessorKey: "is_verified_purchase",
      cell: (row: any) => row.is_verified_purchase ? (
        <span className="text-[9px] font-black uppercase text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded">Verified</span>
      ) : null
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
    { name: "user_name", label: "Client Name", type: "text", required: true },
    { name: "rating", label: "Rating (1-5)", type: "number", required: true },
    { name: "content", label: "Testimonial Content", type: "textarea", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
      ],
    },
  ];

  return (
    <GenericAdminView
      moduleName="testimonials"
      title="Client Endorsements"
      addButtonText="ADD NEW TESTIMONIAL"
      columns={columns as any}
      formFields={formFields as any}
      icon={Quote}
    />
  );
}

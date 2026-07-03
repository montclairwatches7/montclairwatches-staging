import GenericAdminView from "./GenericAdminView";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminFAQ() {
  const columns = [
    {
      header: "Question",
      accessorKey: "question",
      cell: (row: any) => (
        <span className="font-bold text-sm line-clamp-1 max-w-[400px]">{row.question}</span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row: any) => (
        <Badge variant="secondary" className="uppercase text-[9px] font-bold tracking-widest px-2">
            {row.category}
        </Badge>
      )
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
    { name: "question", label: "The Question", type: "text", required: true },
    { name: "category", label: "Category / Group", type: "text", required: true, placeholder: "e.g. Shipping, Warranty, Authentication" },
    { name: "answer", label: "The Answer", type: "richtext", required: true },
    {
      name: "status",
      label: "Visibility",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Hidden", value: "inactive" },
      ],
    },
  ];

  return (
    <GenericAdminView
      moduleName="faqs"
      title="Intelligence & FAQ"
      addButtonText="ADD NEW FAQ"
      columns={columns as any}
      formFields={formFields as any}
      icon={HelpCircle}
    />
  );
}

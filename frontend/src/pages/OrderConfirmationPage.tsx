import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Share2,
  Printer,
} from "lucide-react";

export default function OrderConfirmationPage() {
  const { id } = useParams();

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 animate-fade-in">
      <div className="max-w-xl w-full px-6 text-center">
        <div className="inline-flex items-center justify-center p-6 bg-primary/5 rounded-full mb-8">
          <CheckCircle size={48} className="text-primary" />
        </div>
        <h1 className="font-heading text-4xl md:text-5xl mb-6">
          Order <em>Successfully</em>
        </h1>

        <div className="bg-secondary/50 p-8 border border-border mb-10 text-left">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We’ve securely received your request, and our team is now processing
            it with care. You will receive timely updates as your order moves
            through each stage, including confirmation, preparation, and
            dispatch. Thank you for choosing us—we appreciate your trust.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/order-history"
            className="bg-primary text-primary-foreground py-4 text-[10px] tracking-luxury uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Track Status <Package size={14} />
          </Link>
          <Link
            to="/collection"
            className="border border-foreground py-4 text-[10px] tracking-luxury uppercase flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-colors"
          >
            Explore More <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

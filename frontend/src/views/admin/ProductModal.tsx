import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Watch,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Formik, Form } from "formik";
import { productsSchema, validateWithZod } from "./validationSchemas";

interface Props {
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({ product, onClose, onSuccess }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: response } = await api.get("/categories");
        if (response?.success && Array.isArray(response.data)) {
          setCategories(response.data.filter((c: any) => c.status === "active"));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      if (product.images) {
        try {
          const imgs =
            typeof product.images === "string"
              ? JSON.parse(product.images)
              : product.images;
          setExistingImages(imgs);
        } catch (e) {
          if (product.image) setExistingImages([product.image]);
        }
      } else if (product.image) {
        setExistingImages([product.image]);
      }
    }
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExisting = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNew = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const initialValues = {
    name: product?.name || "",
    brand: product?.brand || "",
    model_number: product?.model_number || "",
    category: product?.category || "",
    collection: product?.collection || "",
    mrp: product?.mrp || "",
    price: product?.price || "",
    case_diameter: product?.case_diameter || "",
    case_material: product?.case_material || "",
    dial_colour: product?.dial_colour || "",
    movement_type: product?.movement_type || "",
    caliber: product?.caliber || "",
    water_resistance: product?.water_resistance || "",
    strap_material: product?.strap_material || "",
    crystal: product?.crystal || "",
    functions: product?.functions || "",
    power_reserve: product?.power_reserve || "",
    case_thickness: product?.case_thickness || "",
    lug_width: product?.lug_width || "",
    warranty: product?.warranty || "",
    key_highlights: product?.key_highlights || "",
    whats_in_the_box: product?.whats_in_the_box || "",
    status: product?.status || "active",
    stock_quantity: product?.stock_quantity !== undefined ? product.stock_quantity : "",
  };

  const onSubmit = async (values: typeof initialValues) => {
    setError(null);
    setLoading(true);

    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      data.append(key, String(value));
    });

    data.append("existingImages", JSON.stringify(existingImages));

    files.forEach((file) => {
      data.append("images", file);
    });

    try {
      if (product) {
        await api.put(`/admin/products/${product.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast({ title: product ? "Product Updated" : "Product Created" });
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "An unexpected system error occurred.";
      setError(msg);
      toast({
        title: "Submission Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl relative rounded-[40px] overflow-hidden border-none animate-in zoom-in-95 duration-300">
        <div className="bg-[#b87333] px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Watch size={20} className="text-white" />
            </div>
            <div>

              <h3 className="text-xl font-bold text-white leading-tight">
                Add New Product
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          validate={(values) => {
            const errors = validateWithZod(productsSchema)(values);
            if (!product && !errors.stock_quantity) {
              const stock = values.stock_quantity === "" || values.stock_quantity === null || values.stock_quantity === undefined ? 0 : Number(values.stock_quantity);
              if (stock <= 0) {
                errors.stock_quantity = "Stock quantity must be greater than 0 for new products";
              }
            }
            // Image is required for new products
            if (!product && files.length === 0 && existingImages.length === 0) {
              (errors as any).images = "At least one product image is required";
            }
            return errors;
          }}
          onSubmit={onSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, submitCount }) => (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <Form className="p-8 space-y-8">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-4 text-rose-600 animate-in fade-in slide-in-from-top-4 duration-300">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">{error}</p>
                  </div>
                )}

                <section className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <ImageIcon size={14} className="text-[#b87333]" /> Product Image
                    </label>
                    <Badge className="bg-white text-[#b87333] border-slate-200 text-[9px] font-bold tracking-widest uppercase">
                      {existingImages.length + files.length} Total
                    </Badge>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    <label className="w-28 h-28 shrink-0 rounded-[28px] border-2 border-dashed border-slate-200 hover:border-[#b87333] hover:bg-[#b87333]/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 bg-white group">
                      <Upload
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                        size={16}
                      />
                      <span className="text-[8px] tracking-luxury uppercase font-bold">Add</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {existingImages.map((src, idx) => (
                      <div
                        key={`img-${idx}`}
                        className="w-28 h-28 shrink-0 bg-white border border-slate-100 rounded-[28px] relative group overflow-hidden shadow-sm"
                      >
                        <img
                          src={src}
                          alt="Product"
                          className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeExisting(idx)}
                          className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    {previews.map((src, idx) => (
                      <div
                        key={`new-${idx}`}
                        className="w-28 h-28 shrink-0 bg-white border border-slate-100 rounded-[28px] relative group overflow-hidden shadow-sm"
                      >
                        <img
                          src={src}
                          alt="Preview"
                          className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeNew(idx)}
                          className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {submitCount > 0 && (errors as any).images && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1 mt-2">{(errors as any).images}</p>
                  )}
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h4 className="text-[10px] tracking-luxury uppercase font-bold text-primary">
                      Core Information
                    </h4>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                        Product Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="name"
                        className={cn(
                          "w-full h-11 bg-slate-50/50 border px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all",
                          touched.name && errors.name ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Rolex Submariner Date"
                      />
                      {touched.name && errors.name && (
                        <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                        Brand <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="brand"
                        className={cn(
                          "w-full h-11 bg-slate-50/50 border px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all",
                          touched.brand && errors.brand ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                        value={values.brand}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Rolex"
                      />
                      {touched.brand && errors.brand && (
                        <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.brand}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Model Number</label>
                      <input
                        name="model_number"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.model_number}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 126610LN"
                      />
                      {touched.model_number && errors.model_number && (
                        <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.model_number}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="category"
                        className={cn(
                          "w-full h-11 bg-slate-50/50 border px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all appearance-none",
                          touched.category && errors.category ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                        value={values.category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {touched.category && errors.category && (
                        <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.category}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Collection</label>
                      <input
                        name="collection"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.collection}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Submariner"
                      />
                      {touched.collection && errors.collection && (
                        <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.collection}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                        MRP (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="mrp"
                        type="number"
                        min="0"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        className={cn(
                          "w-full h-11 bg-slate-50/50 border px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all",
                          touched.mrp && errors.mrp ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                        value={values.mrp}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.mrp && errors.mrp && (
                        <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.mrp}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                        Selling Price (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="price"
                        type="number"
                        className={cn(
                          "w-full h-11 bg-slate-50/50 border px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all",
                          touched.price && errors.price ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                        value={values.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.price && errors.price && (
                        <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.price}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Status</label>
                      <select
                        name="status"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all appearance-none"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Stock Quantity</label>
                      <input
                        name="stock_quantity"
                        type="number"
                        min="0"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        className={cn(
                          "w-full h-11 bg-slate-50/50 border px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all",
                          touched.stock_quantity && errors.stock_quantity ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                        )}
                        value={values.stock_quantity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.stock_quantity && errors.stock_quantity && (
                        <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.stock_quantity}</p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b87333] whitespace-nowrap">
                      Technical Specifications
                    </h4>
                    <div className="h-px w-full bg-slate-100" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Case Diameter</label>
                      <input
                        name="case_diameter"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.case_diameter}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 41mm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Case Material</label>
                      <input
                        name="case_material"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.case_material}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Oystersteel"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Dial Colour</label>
                      <input
                        name="dial_colour"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.dial_colour}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Black"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Movement Type</label>
                      <input
                        name="movement_type"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.movement_type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Automatic"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Caliber</label>
                      <input
                        name="caliber"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.caliber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Cal. 3235"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Water Resistance</label>
                      <input
                        name="water_resistance"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.water_resistance}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 300m / 1000ft"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Strap Material</label>
                      <input
                        name="strap_material"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.strap_material}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Oyster bracelet"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Crystal</label>
                      <input
                        name="crystal"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.crystal}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Sapphire"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Power Reserve</label>
                      <input
                        name="power_reserve"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.power_reserve}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 70 hours"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Case Thickness</label>
                      <input
                        name="case_thickness"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.case_thickness}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 12.5mm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Lug Width</label>
                      <input
                        name="lug_width"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.lug_width}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 21mm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Warranty</label>
                      <input
                        name="warranty"
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.warranty}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 5 years"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Functions</label>
                    <input
                      name="functions"
                      className="w-full h-11 bg-slate-50/50 border border-slate-200 px-4 rounded-2xl text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                      value={values.functions}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Date, Bezel, Lume"
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b87333] whitespace-nowrap flex items-center gap-2">
                      <Sparkles size={14} /> Marketing Content
                    </h4>
                    <div className="h-px w-full bg-slate-100" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Key Highlights</label>
                      <textarea
                        name="key_highlights"
                        rows={5}
                        className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-[32px] text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.key_highlights}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="• Feature 1: Benefit&#10;• Feature 2: Benefit..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">What's in the Box</label>
                      <textarea
                        name="whats_in_the_box"
                        rows={5}
                        className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-[32px] text-sm focus:outline-none focus:border-[#b87333] focus:ring-4 focus:ring-[#b87333]/5 transition-all"
                        value={values.whats_in_the_box}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Watch, Box, Papers, Warranty Card..."
                      />
                    </div>
                  </div>
                </section>

                <footer className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4 flex-shrink-0 sticky bottom-0 z-50">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold shadow-xl shadow-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>{product ? "Update Product" : "Add New Product"}</span>
                      </>
                    )}
                  </button>
                </footer>
              </Form>
            </div>
          )}
        </Formik>
      </div>
    </div>
  );
}

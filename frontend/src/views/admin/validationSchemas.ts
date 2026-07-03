import { z } from "zod";

export const validateWithZod = (schema: z.ZodSchema<any>) => {
  return (values: any) => {
    try {
      schema.parse(values);
      return {};
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error && Array.isArray(error.errors)) {
        error.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
      }
      return errors;
    }
  };
};

export const bannersSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must not exceed 255 characters"),
  subtitle: z.string().max(500, "Subtitle must not exceed 500 characters").optional().or(z.literal("")),
  image_url: z.string().min(1, "Banner image URL is required"),
  mobile_image_url: z.string().optional().or(z.literal("")),
  cta_1_text: z.string().max(50).optional().or(z.literal("")),
  cta_1_link: z.string().max(255).optional().or(z.literal("")),
  cta_2_text: z.string().max(50).optional().or(z.literal("")),
  cta_2_link: z.string().max(255).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  display_order: z.preprocess((val) => val === "" || val === null || val === undefined ? 0 : Number(val), z.number().int("Must be an integer"))
});

export const testimonialsSchema = z.object({
  user_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  content: z.string().min(10, "Review content must be at least 10 characters").max(2000),
  rating: z.preprocess((val) => Number(val), z.number().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5")),
  is_verified_purchase: z.preprocess((val) => val === "true" || val === true || val === 1 || val === "1", z.boolean()),
  status: z.enum(["active", "inactive", "pending"])
});

export const brandsSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  logo_url: z.string().min(1, "Logo URL is required"),
  is_premium: z.preprocess((val) => val === "true" || val === true || val === 1 || val === "1", z.boolean()),
  status: z.enum(["active", "inactive"])
});

export const faqsSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters").max(500),
  answer: z.string().min(10, "Answer must be at least 10 characters").max(5000),
  category: z.string().min(1, "Category is required").max(100),
  status: z.enum(["active", "inactive"])
});

export const servicesSchema = z.object({
  title: z.string().min(1, "Service title is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  icon_name: z.string().min(1, "Icon name is required").max(50),
  status: z.enum(["active", "inactive"]),
  display_order: z.preprocess((val) => val === "" || val === null || val === undefined ? 0 : Number(val), z.number().int())
});

export const teamsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  bio: z.string().max(2000).optional().or(z.literal("")),
  avatar_url: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"])
});

export const postsSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255).regex(/^[a-z0-9-]+$/, "Slug must be URL-safe (lowercase letters, numbers, and dashes)"),
  excerpt: z.string().max(500, "Excerpt cannot exceed 500 characters").optional().or(z.literal("")),
  content: z.string().min(10, "Content must be at least 10 characters"),
  featured_image_url: z.string().optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(["published", "draft", "archived"])
});

export const pagesSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255).regex(/^[a-z0-9-]+$/, "Slug must be URL-safe"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["active", "inactive"])
});

export const categoriesSchema = z.object({
  name: z.string().min(1, "Category name is required").max(255),
  slug: z.string().max(255).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  image_url: z.string().optional().or(z.literal(""))
});

export const productsSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(255),
  brand: z.string().min(1, "Brand is required").max(255),
  model_number: z.string().max(255).optional().or(z.literal("")),
  category: z.string().min(1, "Category is required").max(255),
  collection: z.string().max(255).optional().or(z.literal("")),
  mrp: z.preprocess((val) => val === "" || val === null || val === undefined ? undefined : Number(val), z.number({ required_error: "MRP is required" }).min(0, "MRP cannot be negative")),
  price: z.preprocess((val) => Number(val), z.number({ required_error: "Price is required" }).positive("Price must be a positive number")),
  case_diameter: z.string().max(255).optional().or(z.literal("")),
  case_material: z.string().max(255).optional().or(z.literal("")),
  dial_colour: z.string().max(255).optional().or(z.literal("")),
  movement_type: z.string().max(255).optional().or(z.literal("")),
  caliber: z.string().max(255).optional().or(z.literal("")),
  water_resistance: z.string().max(255).optional().or(z.literal("")),
  strap_material: z.string().max(255).optional().or(z.literal("")),
  crystal: z.string().max(255).optional().or(z.literal("")),
  functions: z.string().max(1000).optional().or(z.literal("")),
  power_reserve: z.string().max(255).optional().or(z.literal("")),
  case_thickness: z.string().max(255).optional().or(z.literal("")),
  lug_width: z.string().max(255).optional().or(z.literal("")),
  warranty: z.string().max(255).optional().or(z.literal("")),
  key_highlights: z.string().optional().or(z.literal("")),
  whats_in_the_box: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  stock_quantity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Stock quantity is required" })
      .int("Stock quantity must be an integer")
      .min(0, "Stock cannot be negative")
  ),
  existingImages: z.string().optional(),
});

export const couponsSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50).regex(/^[A-Za-z0-9]+$/, "Code must be alphanumeric"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Discount value is required", invalid_type_error: "Discount value must be a number" })
      .positive("Discount value must be positive")
  ),
  min_order_value: z.preprocess((val) => val === "" || val === null || val === undefined ? 0 : Number(val), z.number().min(0, "Minimum order value cannot be negative")),
  max_discount_limit: z.preprocess((val) => val === "" || val === null || val === undefined ? null : Number(val), z.number().min(0, "Max cap cannot be negative").nullable().optional()),
  start_date: z.preprocess((val) => {
    if (!val || val === "") return undefined;
    if (val instanceof Date) return val;
    return new Date(val as string);
  }, z.date().optional()),
  expiry_date: z.preprocess((val) => {
    if (val instanceof Date) return val;
    return new Date(val as string);
  }, z.date({ required_error: "Expiry date is required" })),
  usage_limit_total: z.preprocess((val) => val === "" || val === null || val === undefined ? null : Number(val), z.number().int().min(1).nullable().optional()),
  usage_limit_per_user: z.preprocess((val) => val === "" || val === null || val === undefined ? 1 : Number(val), z.number().int().min(1)),
  status: z.enum(["active", "inactive", "disabled"])
}).superRefine((data, ctx) => {
  if (data.discount_type === "percentage" && data.discount_value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: 100,
      type: "number",
      inclusive: true,
      message: "Percentage cannot exceed 100%",
      path: ["discount_value"],
    });
  }
  if (data.start_date && data.expiry_date && data.expiry_date <= data.start_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expiry date must be after start date",
      path: ["expiry_date"],
    });
  }
});

export const validationSchemas: Record<string, z.ZodSchema<any>> = {
  banners: bannersSchema,
  testimonials: testimonialsSchema,
  brands: brandsSchema,
  faqs: faqsSchema,
  services: servicesSchema,
  teams: teamsSchema,
  posts: postsSchema,
  pages: pagesSchema,
  categories: categoriesSchema,
  products: productsSchema,
  coupons: couponsSchema
};

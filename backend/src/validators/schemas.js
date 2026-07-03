const { z } = require('zod');

// Coercion utilities for form uploads
const coerceNumber = (schema = z.number()) => z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const num = Number(val);
  return isNaN(num) ? val : num;
}, schema);

const coerceBoolean = (schema = z.boolean()) => z.preprocess((val) => {
  if (val === 'true' || val === '1' || val === true || val === 1) return true;
  if (val === 'false' || val === '0' || val === false || val === 0) return false;
  if (val === '' || val === null || val === undefined) return undefined;
  return val;
}, schema);

const safeUrl = z.string().refine((val) => {
  if (!val) return false;
  if (val.startsWith('/')) return true;
  try {
    new URL(val);
    return true;
  } catch (e) {
    return false;
  }
}, { message: "Invalid URL or path" });

const schemas = {
  banners: z.object({
    title: z.string().min(3).max(255),
    subtitle: z.string().max(500).nullish(),
    image_url: safeUrl,
    mobile_image_url: safeUrl.nullish(),
    cta_1_text: z.string().max(50).nullish(),
    cta_1_link: z.string().max(255).nullish(),
    cta_2_text: z.string().max(50).nullish(),
    cta_2_link: z.string().max(255).nullish(),
    status: z.enum(['active', 'inactive']).default('active'),
    display_order: z.preprocess((val) => val === '' || val === null || val === undefined ? 0 : Number(val), z.number().int()).default(0)
  }),

  testimonials: z.object({
    user_name: z.string().min(2).max(100),
    content: z.string().min(10).max(2000),
    rating: coerceNumber(z.number().min(1).max(5)),
    is_verified_purchase: coerceBoolean(z.boolean().default(true)),
    status: z.enum(['active', 'inactive', 'pending']).default('active')
  }),

  brands: z.object({
    name: z.string().min(1).max(100),
    logo_url: safeUrl,
    is_premium: coerceBoolean(z.boolean().default(true)),
    status: z.enum(['active', 'inactive']).default('active')
  }),

  faqs: z.object({
    question: z.string().min(10).max(500),
    answer: z.string().min(10).max(5000),
    category: z.string().min(1).max(100),
    status: z.enum(['active', 'inactive']).default('active')
  }),

  services: z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    icon_name: z.string().min(1).max(50),
    status: z.enum(['active', 'inactive']).default('active'),
    display_order: z.preprocess((val) => val === '' || val === null || val === undefined ? 0 : Number(val), z.number().int()).default(0)
  }),

  teams: z.object({
    name: z.string().min(1).max(100),
    role: z.string().min(1).max(100),
    bio: z.string().max(2000).nullish(),
    avatar_url: safeUrl.nullish(),
    status: z.enum(['active', 'inactive']).default('active')
  }),

  posts: z.object({
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    excerpt: z.string().max(500).nullish(),
    content: z.string().min(1),
    featured_image_url: safeUrl.nullish(),
    category: z.string().max(100).nullish(),
    status: z.enum(['published', 'draft', 'archived']).default('draft')
  }),

  pages: z.object({
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    content: z.string().min(1),
    status: z.enum(['active', 'inactive']).default('active')
  }),

  categories: z.object({
    name: z.string().min(1).max(255),
    slug: z.string().max(255).nullish(),
    status: z.enum(['active', 'inactive']).default('active'),
    image_url: safeUrl.nullish()
  }),

  products: z.object({
    name: z.string().min(3).max(255),
    brand: z.string().min(1).max(255),
    model_number: z.string().max(255).nullish(),
    category: z.preprocess((val) => val === '' ? null : val, z.string().max(255).nullish()),
    collection: z.string().max(255).nullish(),
    mrp: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : Number(val), z.number({ required_error: 'MRP is required' }).min(0, 'MRP cannot be negative')),
    price: coerceNumber(z.number().positive()),
    case_diameter: z.string().max(255).nullish(),
    case_material: z.string().max(255).nullish(),
    dial_colour: z.string().max(255).nullish(),
    movement_type: z.string().max(255).nullish(),
    caliber: z.string().max(255).nullish(),
    water_resistance: z.string().max(255).nullish(),
    strap_material: z.string().max(255).nullish(),
    crystal: z.string().max(255).nullish(),
    functions: z.string().max(1000).nullish(),
    power_reserve: z.string().max(255).nullish(),
    case_thickness: z.string().max(255).nullish(),
    lug_width: z.string().max(255).nullish(),
    warranty: z.string().max(255).nullish(),
    key_highlights: z.string().nullish(),
    whats_in_the_box: z.string().nullish(),
    status: z.enum(['active', 'inactive']).default('active'),
    stock_quantity: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number({ required_error: 'Stock quantity is required' })
        .int('Stock quantity must be an integer')
        .min(0, 'Stock cannot be negative')
    ),
    existingImages: z.string().nullish(),
  }),

  coupons: z.object({
    code: z.string().min(3).max(50).transform(val => val.toUpperCase()),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: coerceNumber(
      z.number({ required_error: 'Discount value is required', invalid_type_error: 'Discount value must be a number' })
        .positive('Discount value must be positive')
    ),
    min_order_value: z.preprocess((val) => val === '' || val === null || val === undefined ? 0 : Number(val), z.number().min(0)).default(0),
    max_discount_limit: z.preprocess((val) => val === '' || val === null || val === undefined ? null : Number(val), z.number().min(0, 'Max cap cannot be negative').nullable()),
    start_date: z.preprocess((val) => {
      if (!val || val === '') return undefined;
      return new Date(val);
    }, z.date().optional()),
    expiry_date: z.preprocess((val) => new Date(val), z.date()),
    usage_limit_total: z.preprocess((val) => val === '' || val === null || val === undefined ? null : Number(val), z.number().int().min(1).nullable()),
    usage_limit_per_user: z.preprocess((val) => val === '' || val === null || val === undefined ? 1 : Number(val), z.number().int().min(1)).default(1),
    status: z.enum(['active', 'inactive', 'disabled']).default('active')
  }).superRefine((data, ctx) => {
    if (data.discount_type === 'percentage' && data.discount_value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 100,
        type: 'number',
        inclusive: true,
        message: 'Percentage cannot exceed 100%',
        path: ['discount_value'],
      });
    }
  }),

  register: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
  }),

  login: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
  }),

  forgotPassword: z.object({
    email: z.string().email('Please enter a valid email address')
  }),

  verifyOTP: z.object({
    email: z.string().email('Please enter a valid email address'),
    otp: z.string().length(6, 'Verification code must be exactly 6 digits')
  }),

  resetPassword: z.object({
    email: z.string().email('Please enter a valid email address'),
    otp: z.string().length(6, 'Verification code must be exactly 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long')
  })
};

const validateRequestPayload = (moduleName) => {
  return (req, res, next) => {
    const schema = schemas[moduleName];
    if (!schema) {
      return next(); 
    }
    
    if (req.route.path === '/bulk' || req.originalUrl.includes('/bulk')) {
       return next();
    }
    
    if (req.route.path === '/:id/status') {
      const statusSchema = z.object({ status: z.string().min(1) });
      const result = statusSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(422).json({ success: false, message: result.error.errors[0].message });
      }
      return next();
    }

    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return res.status(422).json({
        success: false,
        message: 'Validation failed: ' + errorMessages,
        errors: result.error.errors.map(err => ({
          message: err.message,
          path: err.path
        }))
      });
    }
    
    req.body = result.data;
    next();
  };
};

module.exports = { schemas, validateRequestPayload };

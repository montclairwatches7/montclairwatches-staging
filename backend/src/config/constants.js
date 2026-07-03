const APP_CONFIG = {
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    ADMIN_USERS_LIMIT: 50, // Total fetch limit for admin view
    ADMIN_PRODUCTS_LIMIT: 20,
  },
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
};

module.exports = APP_CONFIG;

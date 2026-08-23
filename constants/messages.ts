export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Welcome back! Successfully logged in.",
    LOGIN_ERROR: "Invalid email or password. Please try again.",
    REGISTER_SUCCESS: "Account registered successfully! You can now log in.",
    REGISTER_ERROR: "Failed to create account. Please check your details.",
    EMAIL_EXISTS: "A user with this email address already exists.",
    UNAUTHORIZED: "You must be logged in to access this area.",
    FORBIDDEN: "Access Denied: You do not have administrative permissions.",
    LOGOUT_SUCCESS: "Successfully logged out.",
  },
  ARTICLES: {
    CREATED: "Article published successfully!",
    UPDATED: "Article updated successfully!",
    DELETED: "Article deleted successfully!",
    FETCH_ERROR: "Failed to load articles.",
    NOT_FOUND: "The requested article was not found.",
  },
  CATEGORIES: {
    CREATED: "Category created successfully!",
    UPDATED: "Category updated successfully!",
    DELETED: "Category deleted successfully!",
    FETCH_ERROR: "Failed to load categories.",
  },
  UPLOAD: {
    SUCCESS: "Image uploaded successfully!",
    ERROR: "Failed to upload image. Please try again.",
    NO_FILE: "No image file provided for upload.",
  },
  SYSTEM: {
    SERVER_ERROR: "An unexpected server error occurred. Please try again.",
    VALIDATION_ERROR: "Please fill in all required fields properly.",
    HEALTH_OK: "System is fully operational.",
  },
} as const;

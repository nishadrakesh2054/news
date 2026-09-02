import { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { MESSAGES } from "@/constants/messages";
import { requireStaff } from "@/lib/admin-auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return apiError(MESSAGES.UPLOAD.NO_FILE, 400);
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return apiError("Unsupported file type", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("File exceeds 5MB limit", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "news_articles" },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      ).end(buffer);
    });

    return apiSuccess(result, MESSAGES.UPLOAD.SUCCESS, 200);
  } catch (error) {
    return handleServerError(error, MESSAGES.UPLOAD.ERROR);
  }
}

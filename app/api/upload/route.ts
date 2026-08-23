import { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { MESSAGES } from "@/constants/messages";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return apiError(MESSAGES.UPLOAD.NO_FILE, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "news_articles" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return apiSuccess(result, MESSAGES.UPLOAD.SUCCESS, 200);
  } catch (error) {
    return handleServerError(error, MESSAGES.UPLOAD.ERROR);
  }
}

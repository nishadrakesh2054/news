import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { CommentStatus, Role, ArticleStatus } from "@prisma/client";
import { validateCommentCreate } from "@/lib/validations/comment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;

    if (!articleId) {
      return apiError("Article ID is required", 400);
    }

    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        status: CommentStatus.APPROVED,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        authorName: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return apiSuccess(comments, "Comments fetched successfully");
  } catch (error) {
    return handleServerError(error, "Failed to fetch comments");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      return apiError("समाचार भेटिएन (Article not found)", 404);
    }

    const validation = validateCommentCreate(body);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }

    const { content, authorName, authorEmail } = validation.data;

    let isAutoApproved = false;
    let authorId: string | null = null;
    let finalAuthorName = authorName?.trim() || null;

    if (session?.user) {
      authorId = session.user.id;
      finalAuthorName = session.user.name || finalAuthorName;
      if (([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
        isAutoApproved = true;
      }
    }

    if (!authorId && (!finalAuthorName || !finalAuthorName.trim())) {
      return apiError("तपाईंको नाम आवश्यक छ (Author name required)", 400);
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        articleId,
        authorId,
        authorName: finalAuthorName,
        authorEmail: authorEmail?.trim() || session?.user?.email || null,
        status: isAutoApproved ? CommentStatus.APPROVED : CommentStatus.PENDING,
      },
    });

    return apiSuccess(
      comment,
      isAutoApproved
        ? "प्रतिक्रिया प्रकाशित भयो (Comment published)"
        : "तपाईंको प्रतिक्रिया स्वीकृतिका लागि पठाइयो (Comment submitted for moderation)",
      201
    );
  } catch (error) {
    return handleServerError(error, "Failed to post comment");
  }
}

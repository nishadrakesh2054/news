import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { CommentStatus, Role, ArticleStatus } from "@prisma/client";
import { validateCommentCreate } from "@/lib/validations/comment";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { looksLikeSpam } from "@/lib/comment-moderation";

const DEFAULT_COMMENT_LIMIT = 50;
const MAX_COMMENT_LIMIT = 100;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;

    if (!articleId) {
      return apiError("Article ID is required", 400);
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || "";
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_COMMENT_LIMIT), 10) || DEFAULT_COMMENT_LIMIT),
      MAX_COMMENT_LIMIT
    );

    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        status: CommentStatus.APPROVED,
      },
      orderBy: { createdAt: "desc" },
      take: cursor ? limit + 1 : limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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

    const hasMore = cursor ? comments.length > limit : false;
    const pageComments = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? pageComments[pageComments.length - 1]?.id ?? null : null;

    const res = apiSuccess({
      comments: pageComments,
      pagination: cursor
        ? { limit, nextCursor, hasMore }
        : { limit, count: pageComments.length },
    });
    res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    return res;
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
      select: { id: true, status: true },
    });

    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      return apiError("समाचार भेटिएन (Article not found)", 404);
    }

    const validation = validateCommentCreate(body);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }

    const { content, authorName, authorEmail } = validation.data;

    if (!session?.user || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      const ip = getClientIp(request);
      const rate = checkRateLimit(`comment:${ip}:${articleId}`, 5, 15 * 60 * 1000);
      if (!rate.allowed) {
        return apiError(
          `धेरै प्रयास। ${rate.retryAfterSec ?? 60} सेकेन्ड पछि प्रयास गर्नुहोस्।`,
          429
        );
      }
    }

    let isAutoApproved = false;
    let authorId: string | null = null;
    let finalAuthorName = authorName?.trim() || null;
    let commentStatus: CommentStatus = CommentStatus.PENDING;

    if (looksLikeSpam(content)) {
      commentStatus = CommentStatus.SPAM;
    }

    if (session?.user) {
      authorId = session.user.id;
      finalAuthorName = session.user.name || finalAuthorName;
      if (([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
        isAutoApproved = true;
        commentStatus = CommentStatus.APPROVED;
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
        status: commentStatus,
      },
      select: {
        id: true,
        content: true,
        authorName: true,
        createdAt: true,
        status: true,
      },
    });

    return apiSuccess(
      comment,
      isAutoApproved
        ? "प्रतिक्रिया प्रकाशित भयो (Comment published)"
        : commentStatus === CommentStatus.SPAM
          ? "Comment flagged as spam"
          : "तपाईंको प्रतिक्रिया स्वीकृतिका लागि पठाइयो (Comment submitted for moderation)",
      201
    );
  } catch (error) {
    return handleServerError(error, "Failed to post comment");
  }
}

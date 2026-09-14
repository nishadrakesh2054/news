import { ArticleForm } from "@/components/admin/ArticleForm";

type NewArticlePageProps = {
  searchParams: Promise<{ categoryId?: string }>;
};

export default async function NewArticlePage({ searchParams }: NewArticlePageProps) {
  const params = await searchParams;
  return <ArticleForm defaultCategoryId={params.categoryId} />;
}

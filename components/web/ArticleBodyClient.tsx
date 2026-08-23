"use client";

import { useState } from "react";
import { ArticleReaderControls } from "./ArticleReaderControls";
import { AudioNewsPlayer } from "./AudioNewsPlayer";

interface ArticleBodyClientProps {
  title: string;
  content: string;
  shareUrl: string;
}

export function ArticleBodyClient({ title, content, shareUrl }: ArticleBodyClientProps) {
  const [fontSizeClass, setFontSizeClass] = useState("text-base sm:text-lg");

  // Calculate approximate word count
  const cleanText = content.replace(/<[^>]*>?/gm, "");
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;

  const handleFontSizeChange = (size: "normal" | "medium" | "large") => {
    if (size === "normal") setFontSizeClass("text-base sm:text-lg");
    else if (size === "medium") setFontSizeClass("text-lg sm:text-xl");
    else if (size === "large") setFontSizeClass("text-xl sm:text-2xl leading-loose");
  };

  return (
    <div className="space-y-6">
      {/* Reader Toolbar & Social Actions */}
      <ArticleReaderControls
        title={title}
        shareUrl={shareUrl}
        wordCount={wordCount}
        onFontSizeChange={handleFontSizeChange}
      />

      {/* Audio Text-To-Speech News Player */}
      <AudioNewsPlayer title={title} content={cleanText} />

      {/* Dynamic HTML Content Render */}
      <article
        className={`prose dark:prose-invert max-w-none text-foreground font-sans leading-relaxed space-y-4 font-normal ${fontSizeClass}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

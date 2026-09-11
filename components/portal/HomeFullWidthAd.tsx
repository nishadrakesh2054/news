type HomeFullWidthAdProps = {
  lang?: string;
  /** Optional — wire from ads API / dashboard later */
  imageUrl?: string | null;
  targetUrl?: string | null;
  title?: string;
};

/** Default sample creative until dashboard slot is wired. */
const SAMPLE_AD_IMAGE = "/homead.gif";

/**
 * Full-width mid-home ad strip — image only.
 * Place under first spotlight heading; connect to AdSlot later from dashboard.
 */
export function HomeFullWidthAd({
  lang = "ne",
  imageUrl = SAMPLE_AD_IMAGE,
  targetUrl = "#",
  title,
}: HomeFullWidthAdProps) {
  const isEnglish = lang === "en";
  const src = imageUrl || SAMPLE_AD_IMAGE;

  return (
    <aside className="w-full" aria-label={isEnglish ? "Advertisement" : "विज्ञापन"}>
      <a
        href={targetUrl || "#"}
        className="block w-full overflow-hidden"
        style={{ aspectRatio: "970 / 90" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title || (isEnglish ? "Advertisement" : "विज्ञापन")}
          className="h-full w-full object-contain object-center"
        />
      </a>
    </aside>
  );
}

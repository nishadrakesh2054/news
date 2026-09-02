import { SITE_CONFIG } from "@/constants/site";

export default function WebLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#0C4EA0] border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading {SITE_CONFIG.name}…</p>
      </div>
    </div>
  );
}

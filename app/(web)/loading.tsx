import { PORTAL } from "@/constants/portal";

export default function WebLoading() {
  return (
    <div className={`${PORTAL.container} space-y-6 py-8`}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="h-[300px] animate-pulse bg-muted lg:col-span-8 sm:h-[420px]" />
        <div className="space-y-3 lg:col-span-4">
          <div className="h-16 animate-pulse bg-muted" />
          <div className="h-16 animate-pulse bg-muted" />
          <div className="h-16 animate-pulse bg-muted" />
          <div className="h-16 animate-pulse bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-40 animate-pulse bg-muted" />
        <div className="h-40 animate-pulse bg-muted" />
        <div className="h-40 animate-pulse bg-muted" />
      </div>
    </div>
  );
}

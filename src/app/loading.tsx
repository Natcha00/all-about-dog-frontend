import PageLoading from "@/components/ui/PageLoading";

/**
 * Shown during route transitions (Next.js loading.tsx).
 * Override in any segment with its own loading.tsx for custom loading.
 */
export default function Loading() {
  return <PageLoading message="กำลังโหลด..." />;
}

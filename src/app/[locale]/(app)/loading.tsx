import { Skeleton } from "@/components/shared/states";

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-3xl gap-5 px-4 py-14 sm:px-6" aria-busy aria-label="Chargement">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-5/6" />
      <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
    </div>
  );
}

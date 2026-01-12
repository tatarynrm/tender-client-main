import { Card, CardHeader, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils";

export function TenderCardSkeleton() {
  return (
    <Card className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg overflow-hidden mb-4">
      {/* HEADER SKELETON */}
      <CardHeader className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between w-full gap-2">
          <Skeleton className="h-5 w-48" /> {/* Номер тендера */}
          <Skeleton className="h-4 w-32" /> {/* Дати */}
          <Skeleton className="h-5 w-5 rounded-full" /> {/* Іконка меню */}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* DESKTOP SKELETON (Grid 10 cols) */}
        <div className="hidden md:grid grid-cols-10 text-sm divide-x divide-gray-200 dark:divide-slate-700">
          {/* Кожна колонка скелетона */}
          {[...Array(10)].map((_, i) => (
            <div key={i} className="p-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              {(i === 5 || i === 6 || i === 7) && <Skeleton className="h-3 w-2/3" />}
            </div>
          ))}
        </div>

        {/* MOBILE SKELETON */}
        <div className="md:hidden p-3 space-y-4">
          {/* Маршрут */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-full max-w-[200px]" />
          </div>

          {/* Параметри (авто, вага) */}
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>

          {/* Тип причепа */}
          <Skeleton className="h-4 w-1/2" />

          {/* Опис вантажу */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[90%]" />
          </div>

          {/* Футер мобілки */}
          <div className="pt-2 border-t border-gray-200 flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Компонент-обгортка для списку
export function TenderListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full">
      {[...Array(count)].map((_, i) => (
        <TenderCardSkeleton key={i} />
      ))}
    </div>
  );
}
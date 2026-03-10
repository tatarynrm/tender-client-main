export const renderLocationDetails = (routeData: any) => {
  if (!routeData) return null;

  const { street, house } = routeData;
  const hasStreetInfo = street || house;

  if (!hasStreetInfo) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl">
        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
          {street} {house}
        </span>
      </div>
    </div>
  );
};

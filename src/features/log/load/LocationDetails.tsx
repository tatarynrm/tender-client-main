export const renderLocationDetails = (routeData: any) => {
  if (!routeData) return null;

  const { street, house, ids_region,city } = routeData;
  const hasStreetInfo = street || house;
console.log(routeData,'ROUTE DATA');

  return (
    <div className="flex flex-wrap gap-2 mt-1.5">
      {/* Вулиця та номер будинку */}
      {hasStreetInfo && (
        <span className="text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-500/20">
         {city} {street} {house}
        </span>
      )}


    </div>
  );
};
// import { Star } from "lucide-react";
// import { Badge } from "@/shared/components/ui/badge";
// import { cn } from "@/shared/utils";

// // ... усередині компонента CompanyCard

// const getRatingDetails = (rating: number | string | null) => {
//   const r = Number(rating);
//   switch (r) {
//     case 2:
//       return {
//         label: "Важливий",
//         color: "bg-amber-100 text-amber-700 border-amber-200",
//         stars: 3,
//       };
//     case 1:
//       return {
//         label: "Середній",
//         color: "bg-slate-100 text-slate-700 border-slate-200",
//         stars: 2,
//       };
//     default:
//       return {
//         label: "Загальний",
//         color: "bg-gray-50 text-gray-500 border-gray-100",
//         stars: 1,
//       };
//   }
// };

// const ratingInfo = getRatingDetails(company.raiting);

// // JSX:
// <div className="flex items-center gap-2">
//   <Badge
//     variant="secondary"
//     className={cn(
//       "flex items-center gap-1.5 px-2 py-0.5 font-medium transition-colors",
//       ratingInfo.color
//     )}
//   >
//     <div className="flex -space-x-0.5">
//       {[...Array(ratingInfo.stars)].map((_, i) => (
//         <Star key={i} className="w-3 h-3 fill-current" />
//       ))}
//     </div>
//     <span className="text-[11px] uppercase tracking-wider">
//       {ratingInfo.label}
//     </span>
//   </Badge>
// </div>;

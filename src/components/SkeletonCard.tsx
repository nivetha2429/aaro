const SkeletonCard = () => (
  <div className="rounded-fluid-lg p-fluid flex flex-col h-full bg-white/60 border border-primary/10 animate-pulse overflow-hidden">
    {/* Image placeholder */}
    <div className="aspect-square rounded-fluid mb-1 sm:mb-3 w-full bg-gray-200" />
    {/* Brand */}
    <div className="h-2.5 sm:h-3 w-14 sm:w-16 bg-gray-200 rounded mb-1.5" />
    {/* Title */}
    <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded mb-1" />
    <div className="h-3 sm:h-4 w-1/2 bg-gray-200 rounded mb-2 sm:mb-2.5" />
    {/* Rating */}
    <div className="flex gap-0.5 mb-2 sm:mb-2.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gray-200 rounded-full" />
      ))}
    </div>
    {/* Price */}
    <div className="mt-auto">
      <div className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-200 rounded mb-2 sm:mb-3" />
      {/* Button */}
      <div className="h-9 sm:h-11 w-full bg-gray-200 rounded-fluid" />
    </div>
  </div>
);

export default SkeletonCard;

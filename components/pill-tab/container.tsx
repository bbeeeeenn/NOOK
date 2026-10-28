export function PillTabContainer({
   children,
   cols = 2,
}: {
   children: React.ReactNode;
   cols?: number;
}) {
   return (
      <div className="overflow-x-auto">
         <div
            className="mb-2 grid min-w-65 gap-2 rounded-md bg-gray-100 p-1.5 select-none sm:flex sm:w-fit sm:min-w-0"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
         >
            {children}
         </div>
      </div>
   );
}

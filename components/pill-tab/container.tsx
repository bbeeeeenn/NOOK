export function PillTabContainer({ children }: { children: React.ReactNode }) {
   return (
      <div className="overflow-x-auto">
         <div className="mb-2 flex min-w-65 gap-2 rounded-md bg-gray-100 p-1.5 select-none sm:w-fit sm:min-w-0">
            {children}
         </div>
      </div>
   );
}

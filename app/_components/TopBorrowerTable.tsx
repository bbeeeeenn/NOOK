import { TopBorrowers } from "@/data-access-layer/topBorrowers";

const COLORS = [
   "#fbbc05",
   "#f7c733",
   "#f4d157",
   "#f2d56a",
   "#f1da7c",
   "#efde8e",
   //
   "#c8dbcf",
   "#cae0d2",
];

export default function TopBorrowerTable({
   topBorrowers,
}: {
   topBorrowers: TopBorrowers;
}) {
   const max = topBorrowers[0]?._count.bookBarcode ?? 1;
   return (
      <div className="flex h-full flex-col p-4 text-xs font-medium">
         {topBorrowers.map((b, i) => {
            const percentage = (b._count.bookBarcode / max) * 100;
            return (
               <div
                  key={b.idNumber}
                  className="flex max-h-7 min-h-6 grow items-stretch"
               >
                  <p className="flex w-5.5 items-center justify-end pr-2 text-center">
                     {b._count.bookBarcode}
                  </p>
                  <div className="relative grow">
                     <div
                        className="absolute inset-y-0 left-0 flex items-center justify-end px-1"
                        style={{
                           right: `${100 - percentage}%`,
                           backgroundColor: COLORS[i] ?? COLORS[7],
                        }}
                     >
                        <p className="font-plex-sans truncate text-white">
                           {b.idNumber}
                        </p>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
   );
}

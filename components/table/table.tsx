"use client";

import clsx from "clsx";
import React from "react";

export default function Table({
   headers,
   children,
   extraStyling,
}: {
   extraStyling?: string;
   headers: (React.ReactNode | string)[];
   children: React.ReactNode;
}) {
   return (
      <table
         className={clsx(
            "w-full border-separate border-spacing-0",
            extraStyling,
         )}
      >
         <thead className="bg-[#E8F5E9] text-sm font-bold select-none">
            <tr className="text-black/70">
               {headers.map((h, i) => (
                  <th
                     key={i}
                     className={clsx(
                        "border-b-green-primary py-2 pl-4 text-start uppercase",
                        i === 0 && "rounded-tl-md",
                        i === headers.length - 1 && "rounded-tr-md",
                     )}
                  >
                     {h}
                  </th>
               ))}
            </tr>
         </thead>
         <tbody className="text-sm text-gray-600">{children}</tbody>
      </table>
   );
}

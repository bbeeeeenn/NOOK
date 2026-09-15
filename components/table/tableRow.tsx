import clsx from "clsx";

export default function TableRow({
   data,
   index,
   styles,
}: {
   data: React.ReactNode[];
   index: number;
   styles?: string;
}) {
   return (
      <tr
         className={clsx(
            "bg-gray-50 text-center hover:bg-blue-50",
            index % 2 === 0 && "bg-gray-100",
            styles,
         )}
      >
         {data.map((d, i) => (
            <td key={i} className="p-2">
               {d}
            </td>
         ))}
      </tr>
   );
}

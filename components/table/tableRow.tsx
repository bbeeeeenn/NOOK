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
            "bg-gray-50 hover:bg-blue-50",
            index % 2 === 0 && "bg-gray-100",
            styles,
         )}
      >
         {data.map((d, i) => (
            <td key={i} className="py-2 pl-4">
               {d}
            </td>
         ))}
      </tr>
   );
}

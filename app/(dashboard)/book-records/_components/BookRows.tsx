import TableRow from "@/components/table/tableRow";
import { BookRecordModel } from "@/generated/prisma/models";

function BookRow({
   index,
   bookRecord,
}: {
   index: number;
   bookRecord: BookRecordModel;
}) {
   return (
      <TableRow
         index={index}
         data={[
            bookRecord.copyCode,
            bookRecord.callnumber,
            bookRecord.title,
            bookRecord.author,
            bookRecord.sublocation,
            bookRecord.circulationType,
         ]}
      />
   );
}

export default function BookRows({
   records,
   startIndex = 0,
}: {
   records: BookRecordModel[];
   startIndex?: number;
}) {
   return (
      <>
         {records.map((record, index) => (
            <BookRow
               key={record.copyCode}
               index={startIndex + index + 1}
               bookRecord={record}
            />
         ))}
      </>
   );
}

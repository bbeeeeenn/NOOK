import TableRow from "@/components/table/tableRow";
import { BorrowerRecordModel } from "@/generated/prisma/models";

function BorrowerRow({
   index,
   borrowerRecord,
}: {
   index: number;
   borrowerRecord: BorrowerRecordModel;
}) {
   return (
      <TableRow
         index={index}
         data={[
            borrowerRecord.idNumber,
            `${borrowerRecord.firstname}${borrowerRecord.middlename ? " " + borrowerRecord.middlename : ""} ${borrowerRecord.lastname}`,
            borrowerRecord.yearLevel,
            borrowerRecord.college,
            borrowerRecord.program,
         ]}
      />
   );
}

export default function BorrowerRecords({
   records,
   startIndex = 0,
}: {
   records: BorrowerRecordModel[];
   startIndex?: number;
}) {
   return (
      <>
         {records.map((record, i) => (
            <BorrowerRow
               key={record.idNumber}
               index={startIndex + i + 1}
               borrowerRecord={record}
            />
         ))}
      </>
   );
}

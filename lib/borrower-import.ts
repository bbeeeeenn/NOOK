import * as XLSX from "xlsx";

export const BORROWER_IMPORT_HEADERS = [
   "idNumber",
   "firstname",
   "middlename",
   "lastname",
   "gender",
   "college",
   "program",
   "yearLevel",
] as const;

export const BORROWER_IMPORT_MAX_ROWS = 50_000;
export const BORROWER_IMPORT_SAMPLE_SIZE = 25;

export type BorrowerImportRow = {
   idNumber: string;
   firstname: string;
   middlename: string;
   lastname: string;
   gender: "MALE" | "FEMALE";
   college: string;
   program: string;
   yearLevel: number;
};

export type BorrowerImportError = {
   row: number;
   field?: string;
   message: string;
};

export type BorrowerImportValidation = {
   totalRows: number;
   rows: BorrowerImportRow[];
   firstRows: BorrowerImportRow[];
   lastRows: BorrowerImportRow[];
   errors: BorrowerImportError[];
   errorCount: number;
};

function getCellValue(value: unknown): string {
   if (value === null || value === undefined) return "";
   return String(value).trim();
}

// function isExpectedHeaderRow(row: unknown[]): boolean {
//    return (
//       row.length === BORROWER_IMPORT_HEADERS.length &&
//       BORROWER_IMPORT_HEADERS.every(
//          (header, index) => getCellValue(row[index]) === header,
//       )
//    );
// }

function parseYearLevel(value: string): number | null {
   if (!/^[1-6]$/.test(value)) return null;
   return Number(value);
}

function addRequiredFieldError(
   errors: BorrowerImportError[],
   rowNumber: number,
   field: string,
   value: string,
) {
   if (!value) {
      errors.push({
         row: rowNumber,
         field,
         message: `${field} is required`,
      });
   }
}

// Returns xlsx validation result
export function validateBorrowerWorkbook(
   input: ArrayBuffer | Uint8Array,
): BorrowerImportValidation {
   const workbook = XLSX.read(input, {
      type: "array",
      cellDates: false,
      raw: false,
   });
   const firstSheetName = workbook.SheetNames[0];

   if (!firstSheetName) {
      return {
         totalRows: 0,
         rows: [],
         firstRows: [],
         lastRows: [],
         errors: [{ row: 1, message: "The workbook has no worksheets" }],
         errorCount: 1,
      };
   }

   const worksheet = workbook.Sheets[firstSheetName];
   const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      defval: "",
      blankrows: false,
      raw: false,
   });

   if (matrix.length === 0) {
      return {
         totalRows: 0,
         rows: [],
         firstRows: [],
         lastRows: [],
         errors: [{ row: 1, message: "The worksheet is empty" }],
         errorCount: 1,
      };
   }

   const errors: BorrowerImportError[] = [];
   // const headerRow = matrix[0] ?? [];

   // if (!isExpectedHeaderRow(headerRow)) {
   //    errors.push({
   //       row: 1,
   //       message: `Headers must be exactly: ${BORROWER_IMPORT_HEADERS.join(", ")}`,
   //    });
   // }

   const dataRows = matrix.slice(1);
   const totalRows = dataRows.length;

   if (totalRows > BORROWER_IMPORT_MAX_ROWS) {
      errors.push({
         row: BORROWER_IMPORT_MAX_ROWS + 2,
         message: `The worksheet contains ${totalRows.toLocaleString()} rows; the maximum is ${BORROWER_IMPORT_MAX_ROWS.toLocaleString()}`,
      });
   }

   const rows: BorrowerImportRow[] = [];
   const idNumbers = new Set<string>();

   for (const [index, rawRow] of dataRows.entries()) {
      const rowNumber = index + 2;
      const row = rawRow ?? [];
      const [
         idNumber,
         firstname,
         middlename,
         lastname,
         gender,
         college,
         program,
         yearLevelValue,
      ] = BORROWER_IMPORT_HEADERS.map((_, columnIndex) =>
         getCellValue(row[columnIndex]),
      );

      const values = {
         idNumber,
         firstname,
         middlename,
         lastname,
         gender,
         college,
         program,
         yearLevel: yearLevelValue,
      };

      addRequiredFieldError(errors, rowNumber, "idNumber", idNumber);
      addRequiredFieldError(errors, rowNumber, "firstname", firstname);
      addRequiredFieldError(errors, rowNumber, "lastname", lastname);
      addRequiredFieldError(errors, rowNumber, "gender", gender);
      addRequiredFieldError(errors, rowNumber, "college", college);
      addRequiredFieldError(errors, rowNumber, "program", program);
      addRequiredFieldError(errors, rowNumber, "yearLevel", yearLevelValue);

      if (idNumber) {
         if (idNumbers.has(idNumber)) {
            errors.push({
               row: rowNumber,
               field: "idNumber",
               message: `idNumber "${idNumber}" is duplicated in the worksheet`,
            });
         }
         idNumbers.add(idNumber);
      }

      if (gender && gender !== "MALE" && gender !== "FEMALE") {
         errors.push({
            row: rowNumber,
            field: "gender",
            message: "gender must be MALE or FEMALE",
         });
      }

      const yearLevel = parseYearLevel(yearLevelValue);
      if (yearLevelValue && yearLevel === null) {
         errors.push({
            row: rowNumber,
            field: "yearLevel",
            message: "yearLevel must be an integer from 1 to 6",
         });
      }

      if (
         idNumber &&
         firstname &&
         lastname &&
         gender &&
         college &&
         program &&
         yearLevel !== null &&
         (gender === "MALE" || gender === "FEMALE")
      ) {
         rows.push({
            ...values,
            gender,
            yearLevel,
         });
      }
   }

   return {
      totalRows,
      rows,
      firstRows: rows.slice(0, BORROWER_IMPORT_SAMPLE_SIZE),
      lastRows: rows.slice(-BORROWER_IMPORT_SAMPLE_SIZE),
      errors,
      errorCount: errors.length,
   };
}

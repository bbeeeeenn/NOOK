import * as XLSX from "xlsx";

export const BOOK_IMPORT_HEADERS = [
   "copyCode",
   "callnumber",
   "title",
   "author",
] as const;

export const BOOK_IMPORT_MAX_ROWS = 50_000;
export const BOOK_IMPORT_SAMPLE_SIZE = 25;

export type BookImportRow = {
   copyCode: string;
   callnumber: string;
   title: string;
   author: string;
};

export type BookImportError = {
   row: number;
   field?: string;
   message: string;
};

export type BookImportValidation = {
   totalRows: number;
   rows: BookImportRow[];
   firstRows: BookImportRow[];
   lastRows: BookImportRow[];
   errors: BookImportError[];
   errorCount: number;
};

function getCellValue(value: unknown): string {
   if (value === null || value === undefined) return "";
   return String(value).trim();
}

export function validateBookWorkbook(
   input: ArrayBuffer | Uint8Array,
): BookImportValidation {
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

   const errors: BookImportError[] = [];
   const headerRow = matrix[0] ?? [];
   const headerIndexes = new Map<string, number>();
   headerRow.forEach((value, index) => {
      headerIndexes.set(getCellValue(value), index);
   });
   if (
      headerRow.length < BOOK_IMPORT_HEADERS.length ||
      BOOK_IMPORT_HEADERS.some((header) => !headerIndexes.has(header))
   ) {
      errors.push({
         row: 1,
         message: `Headers must include exactly these names, in any order: ${BOOK_IMPORT_HEADERS.join(", ")}`,
      });
   }

   const dataRows = matrix.slice(1);
   const totalRows = dataRows.length;
   if (totalRows === 0) {
      errors.push({
         row: 2,
         message: "The worksheet contains no book records",
      });
   }
   if (totalRows > BOOK_IMPORT_MAX_ROWS) {
      errors.push({
         row: BOOK_IMPORT_MAX_ROWS + 2,
         message: `The worksheet contains ${totalRows.toLocaleString()} rows; the maximum is ${BOOK_IMPORT_MAX_ROWS.toLocaleString()}`,
      });
   }

   const rows: BookImportRow[] = [];
   const copyCodes = new Set<string>();

   for (const [index, rawRow] of dataRows.entries()) {
      const rowNumber = index + 2;
      const row = rawRow ?? [];
      const [copyCode, callnumber, title, author] = BOOK_IMPORT_HEADERS.map(
         (header) => getCellValue(row[headerIndexes.get(header) ?? -1]),
      );
      const values = {
         copyCode,
         callnumber,
         title,
         author,
      };

      for (const [field, value] of Object.entries(values)) {
         if (!value) {
            errors.push({
               row: rowNumber,
               field,
               message: `${field} is required`,
            });
         }
      }

      if (copyCode) {
         if (copyCodes.has(copyCode)) {
            errors.push({
               row: rowNumber,
               field: "copyCode",
               message: `copyCode "${copyCode}" is duplicated in the worksheet`,
            });
         }
         copyCodes.add(copyCode);
      }

      if (Object.values(values).every(Boolean)) rows.push(values);
   }

   return {
      totalRows,
      rows,
      firstRows: rows.slice(0, BOOK_IMPORT_SAMPLE_SIZE),
      lastRows: rows.slice(-BOOK_IMPORT_SAMPLE_SIZE),
      errors,
      errorCount: errors.length,
   };
}

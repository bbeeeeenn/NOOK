import {
   getBookRecords,
   BOOKS_PAGE_SIZE,
} from "@/data-access-layer/bookRecords";
import { adminLoginPage } from "@/constants";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Table from "@/components/table/table";
import BookRows from "./_components/BookRows";
import Filter from "./_components/Filter";
import Pagination from "./_components/Pagination";
import { File, LoaderCircle } from "lucide-react";

type SearchParameters = Promise<{
   copyCode?: string;
   callnumber?: string;
   title?: string;
   author?: string;
   sublocation?: string;
   circulationType?: string;
   page?: string;
   pageSize?: string;
}>;

const headers = [
   "Copy Code",
   "Call Number",
   "Title",
   "Author",
   "Sublocation",
   "Circulation Type",
];

function LoadingRow() {
   return (
      <tr>
         <td colSpan={headers.length}>
            <div className="mx-auto flex w-fit items-center gap-2 py-5 font-medium">
               <LoaderCircle className="animate-spin" size={20} />
               Loading...
            </div>
         </td>
      </tr>
   );
}

async function SuspendedRows({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   const {
      copyCode,
      callnumber,
      title,
      author,
      sublocation,
      circulationType,
      page,
      pageSize,
   } = await searchParams;
   const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
   const currentPageSize = pageSize
      ? Math.max(1, Number.parseInt(pageSize, 10) || BOOKS_PAGE_SIZE)
      : BOOKS_PAGE_SIZE;
   const result = await getBookRecords(
      copyCode,
      callnumber,
      title,
      author,
      sublocation,
      circulationType,
      currentPage,
      currentPageSize,
   );

   if (!result.ok) {
      if (result.error === "AUTH") redirect(adminLoginPage);
      return (
         <tr>
            <td colSpan={headers.length} className="py-2 text-center">
               Unable to load book records.
            </td>
         </tr>
      );
   }

   if (result.data.books.length === 0) {
      return (
         <tr>
            <td colSpan={headers.length} className="py-2">
               <div className="mx-auto flex w-fit items-center gap-1 font-medium">
                  <File size={15} />
                  Empty
               </div>
            </td>
         </tr>
      );
   }

   return (
      <BookRows
         records={result.data.books}
         startIndex={(currentPage - 1) * currentPageSize}
      />
   );
}

async function SuspendedPagination({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   const {
      copyCode,
      callnumber,
      title,
      author,
      sublocation,
      circulationType,
      page,
      pageSize,
   } = await searchParams;
   const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
   const currentPageSize = pageSize
      ? Math.max(1, Number.parseInt(pageSize, 10) || BOOKS_PAGE_SIZE)
      : BOOKS_PAGE_SIZE;
   const result = await getBookRecords(
      copyCode,
      callnumber,
      title,
      author,
      sublocation,
      circulationType,
      currentPage,
      currentPageSize,
   );
   if (!result.ok) return null;

   return (
      <Pagination
         page={currentPage}
         pageSize={currentPageSize}
         total={result.data.total}
         filters={{
            copyCode,
            callnumber,
            title,
            author,
            sublocation,
            circulationType,
         }}
      />
   );
}

async function SuspendedFilter({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   const {
      copyCode,
      callnumber,
      title,
      author,
      sublocation,
      circulationType,
      pageSize,
   } = await searchParams;

   return (
      <Filter
         key={JSON.stringify(await searchParams)}
         initialFilters={{
            copyCode,
            callnumber,
            title,
            author,
            sublocation,
            circulationType,
         }}
         pageSize={pageSize}
      />
   );
}

async function SuspendedBookRecords({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   return (
      <>
         <Suspense>
            <SuspendedFilter searchParams={searchParams} />
         </Suspense>
         <div className="overflow-x-auto">
            <Table headers={headers} extraStyling="min-w-225">
               <Suspense fallback={<LoadingRow />}>
                  <SuspendedRows searchParams={searchParams} />
               </Suspense>
            </Table>
         </div>
         <Suspense>
            <SuspendedPagination searchParams={searchParams} />
         </Suspense>
      </>
   );
}

export default async function BooksPage({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   return (
      <Suspense
         fallback={
            <div className="overflow-x-auto">
               <Table headers={headers} extraStyling="min-w-225">
                  <LoadingRow />
               </Table>
            </div>
         }
      >
         <SuspendedBookRecords searchParams={searchParams} />
      </Suspense>
   );
}

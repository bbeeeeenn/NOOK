import { GOOGLE_BOOKS_API_KEY } from "@/constants";
import axios from "axios";
import { cacheLife } from "next/cache";

export async function fetchBook(isbn: string) {
   "use cache: remote";
   cacheLife("weeks");

   try {
      const googleRes = await axios.get(
         "https://www.googleapis.com/books/v1/volumes",
         {
            params: { q: `isbn:${isbn}`, key: GOOGLE_BOOKS_API_KEY },
            timeout: 5000,
         },
      );

      if (googleRes.data.totalItems > 0) {
         const info = googleRes.data.items[0].volumeInfo;
         return {
            title: info.title,
            authors: (info.authors as string[])?.join(", ") ?? "",
         };
      }
   } catch (error) {
      if (axios.isAxiosError(error)) {
         console.warn(
            `Google Books lookup failed with status ${error.response?.status ?? "unknown"}; trying Open Library.`,
         );
      } else {
         console.warn("Google Books lookup failed; trying Open Library.");
      }
   }

   try {
      const openLibRes = await axios.get("https://openlibrary.org/api/books", {
         params: {
            bibkeys: `ISBN:${isbn}`,
            format: "json",
            jscmd: "data",
         },
         timeout: 5000,
      });
      const bookData = openLibRes.data[`ISBN:${isbn}`];
      if (!bookData) return null;

      return {
         title: bookData.title,
         authors: (bookData.authors ?? [])
            .map((a: { name: string }) => a.name)
            .join(", "),
      };
   } catch (error) {
      if (axios.isAxiosError(error)) {
         console.warn(
            `Open Library lookup failed with status ${error.response?.status ?? "unknown"}.`,
         );
      } else {
         console.warn("Open Library lookup failed.");
      }
      return null;
   }
}

export function normalizeIsbn(isbn: string): string {
   return isbn.replace(/[-\s]/g, "");
}

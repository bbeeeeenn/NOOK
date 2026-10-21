export type Result<T> =
   | {
        ok: true;
        data: T;
     }
   | {
        ok: false;
        error:
           | "AUTH" // not authenticated
           | "FORBIDDEN" // authenticated but not authorized (wrong role/permissions)
           | "NOT_FOUND" // record doesn't exist
           | "VALIDATION" // bad input (missing/malformed fields)
           | "CONFLICT" // duplicate/unique constraint violation (e.g. email already exists)
           | "RATE_LIMITED" // too many requests
           | "DATABASE" // DB-level failure (connection, query error)
           | "OTHER"; // catch-all for unexpected errors
        message: string;
     };

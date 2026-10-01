import { Nook1 } from "@/components/Images";
import { homePage } from "@/constants";
import clsx from "clsx";
import Link from "next/link";

export default function PrivacyPolicy() {
   return (
      <div className="bg-gray-100">
         <nav className="bg-green-primary px-2 py-5">
            <Link href={homePage}>
               <Nook1 className="mx-auto" />
            </Link>
         </nav>
         <main className="font-inter mx-auto max-w-200 py-10 text-sm select-text sm:text-base">
            <h1 className="text-center text-2xl font-bold sm:text-3xl">
               Privacy Policy
            </h1>
            <h2 className="text-center text-lg font-medium sm:text-xl">
               Effective date: October 1, 2026
            </h2>
            <p className="mt-6 text-center font-medium text-balance">
               This Privacy Policy describes how NOOK, the Caraga State
               University Library Admin Panel, collects, uses, and protects
               information in connection with library borrowing operations.
            </p>
            <ol
               className={clsx(
                  "mt-10 list-decimal space-y-6 px-4 marker:text-lg marker:font-bold sm:marker:text-xl",
                  "[&_h2]:text-lg [&_h2]:font-bold sm:[&_h2]:text-xl",
                  "[&_h3]:font-semibold",
                  "[&_p]:text-justify [&_p]:font-medium",
                  "[&_ul]:list-disc [&_ul]:marker:text-base",
                  "[&_ol]:marker:text-base",
                  "**:not-[h2,h3]:ml-2.5 sm:**:not-[h2,h3]:ml-4",
               )}
            >
               <li>
                  <h2>Who This Applies To</h2>
                  <p>
                     NOOK is an internal tool used exclusively by authorized CSU
                     library staff. Access is restricted to a pre-approved list
                     of university email addresses via Google Sign-In. NOOK is
                     not intended for use by students, faculty, or the general
                     public directly, and patrons do not create accounts or log
                     in.
                  </p>
               </li>
               <li>
                  <h2>Information We Collect</h2>
                  <ol className="list-[lower-alpha]">
                     <li>
                        <h3>Patron Information</h3>
                        <ul>
                           <li>ID number</li>
                           <li>Full name</li>
                           <li>
                              Academic program/department and year level or role
                              (e.g., student, instructor)
                           </li>
                           <li>Borrowing history (books borrowed, dates)</li>
                        </ul>
                        <p>
                           This information is entered and maintained by
                           librarians — either imported in bulk from existing
                           university/library records or entered manually during
                           borrowing transactions — as part of routine library
                           operations, not submitted directly by patrons through
                           NOOK.
                        </p>
                     </li>
                     <li>
                        <h3>Librarian Account Information</h3>
                        <ul>
                           <li>
                              University email address (used for Google Sign-In
                              authentication)
                           </li>
                           <li>Login session data</li>
                        </ul>
                     </li>
                  </ol>
               </li>
               <li>
                  <h2>How We Use Information</h2>
                  <p>Information is used solely to:</p>
                  <ul>
                     <li>Track book borrowing and return records</li>
                     <li>Identify and verify patrons during transactions</li>
                     <li>Maintain accurate library records</li>
                     <li>Authenticate authorized library staff</li>
                  </ul>
                  <p>
                     We do not sell, rent, or share this information with third
                     parties for marketing purposes.
                  </p>
               </li>
               <li>
                  <h2>Data Storage and Security</h2>
                  <ul>
                     <li>Data is stored in a secure PostgreSQL database.</li>
                     <li>
                        Librarian accounts are authenticated via Google OAuth
                        (restricted to an allowlist of university emails) or a
                        password-based login secured with industry-standard
                        hashing.
                     </li>
                     <li>
                        Session data is managed via secure, encrypted session
                        cookies.
                     </li>
                     <li>
                        Access to patron records is limited to authenticated
                        library staff.
                     </li>
                  </ul>
               </li>
               <li>
                  <h2>Cookies</h2>
                  <p>
                     NOOK uses a single essential session cookie to keep
                     librarians logged in. This cookie is required for the
                     System to function and is not used for advertising or
                     tracking purposes.
                  </p>
               </li>
               <li>
                  <h2>Data Retention</h2>
                  <p>
                     Patron and borrowing records are retained for as long as
                     necessary to support library operations and academic
                     recordkeeping, in accordance with university policy.
                  </p>
               </li>
               <li>
                  <h2>
                     Your Rights (Republic Act No. 10173 — Data Privacy Act of
                     2012)
                  </h2>
                  <p>
                     As NOOK processes personal information within the
                     Philippines, data subjects (patrons) have rights under the
                     Data Privacy Act of 2012, including the right to:
                  </p>
                  <ul>
                     <li>Be informed of how their data is processed</li>
                     <li>Access their personal data held by the University</li>
                     <li>Request correction of inaccurate data</li>
                     <li>
                        Object to processing, subject to legitimate university
                        interests (e.g., academic recordkeeping)
                     </li>
                  </ul>
                  <p>
                     Requests should be directed to the University&apos;s
                     designated Data Protection Officer or the contact below.
                  </p>
               </li>
               <li>
                  <h2>Contact Us</h2>
                  <p>
                     For questions or concerns about this Privacy Policy, or to
                     request information about your personal data, please
                     contact the Caraga State University Library Office or the
                     University&apos;s designated Data Protection Officer. A
                     contact channel can be provided by the University upon
                     request.
                  </p>
               </li>
               <li>
                  <h2>Changes to This Policy</h2>
                  <p>
                     This Policy may be updated from time to time. Continued use
                     of NOOK after changes are posted constitutes acceptance of
                     the revised Policy.
                  </p>
               </li>
            </ol>
         </main>
         <footer className="bg-green-primary h-6.25" />
      </div>
   );
}

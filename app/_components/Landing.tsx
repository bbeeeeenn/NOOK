import getTopBorrowers from "@/data-access-layer/topBorrowers";
import { Nook2 } from "../../components/Images";
import TopBorrowerTable from "./TopBorrowerTable";
import { Suspense } from "react";
//  https://herolearningcommons.vercel.app/

async function SuspendedTopBorrowerTable() {
   const top = await getTopBorrowers();
   if (!top.ok) {
      return <>Error</>;
   }
   return <TopBorrowerTable topBorrowers={top.data} />;
}

function TopBorrowers() {
   return (
      <div className="flex flex-col px-4 sm:px-10">
         <p className="border-yellow-primary font-inter mb-2 border-l-8 px-2 text-xl font-bold">
            Top Borrowers
         </p>
         {/* <div className="h-5 bg-[#34A853]/12"></div> */}
         <div className="bg-white-primary h-4 space-x-2 p-2 px-6"></div>
         <div className="grow bg-[#34A853]/12">
            <Suspense>
               <SuspendedTopBorrowerTable />
            </Suspense>
         </div>
      </div>
   );
}

export default function Landing() {
   return (
      <div className="my-auto grid grid-cols-1 gap-y-6 bg-white py-7 md:grid-cols-2">
         <div className="flex flex-col items-center space-y-7 px-4 py-8">
            <Nook2 width={331} height={142} />
            <p
               className="font-funnel-sans max-w-82.75 text-justify"
               style={{ fontSize: "14px", lineHeight: "18px" }}
            >
               <span className="text-green-primary font-bold">NOOK</span> stands
               for{" "}
               <span className="text-green-primary font-bold">
                  Navigate, Open, Obtain, Keep
               </span>
               . It is designed to make book borrowing faster, simpler, and more
               organized. It allows students and library staff to use book
               scanning and digital records to streamline the borrowing process
               while reducing manual logging.
            </p>
         </div>
         <TopBorrowers />
      </div>
   );
}

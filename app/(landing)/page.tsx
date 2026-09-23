import { Library } from "@/components/Images";
import Landing from "@/app/_components/Landing";

export default function Home() {
   return (
      <main className="relative top-17.5 flex min-h-[calc(100dvh-70px)] flex-col select-none">
         <div className="fixed inset-0 -z-10">
            <Library className="absolute inset-0 size-full object-cover" />
            <div className="bg-green-primary/70 absolute inset-0" />
         </div>
         <Landing />
      </main>
   );
}

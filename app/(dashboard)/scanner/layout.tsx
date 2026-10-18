import { Library } from "@/components/Images";

export default function Layout({
   children,
}: Readonly<{ children: React.ReactNode }>) {
   return (
      <div className="@container relative min-h-[calc(100dvh-85px)] bg-[#003300]/90 p-4 select-none">
         <Library className="absolute inset-0 -z-10 size-full object-cover" />
         {children}
      </div>
   );
}

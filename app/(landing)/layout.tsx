import Topbar from "../_components/Topbar";

export default function Layout({
   children,
}: Readonly<{ children: React.ReactNode }>) {
   return (
      <>
         {children}
         <Topbar />
      </>
   );
}

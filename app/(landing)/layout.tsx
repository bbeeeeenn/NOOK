import Nav from "../_components/Nav";

export default function Layout({
   children,
}: Readonly<{ children: React.ReactNode }>) {
   return (
      <>
         {children}
         <Nav />
      </>
   );
}

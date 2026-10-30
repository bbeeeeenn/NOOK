import Nav from "./_components/Nav";

export default function Layout({
   children,
}: Readonly<{ children: React.ReactNode }>) {
   return (
      <div className="p-3 pb-25">
         <Nav />
         {children}
      </div>
   );
}

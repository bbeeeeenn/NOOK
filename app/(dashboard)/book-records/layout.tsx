import Nav from "./_components/Nav";

export default function Layout({
   children,
}: Readonly<{ children: React.ReactNode }>) {
   return (
      <div className="p-3 pb-5">
         <Nav />
         {children}
      </div>
   );
}



/* const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}; */

import SideNav from "@/components/side-nav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="container mx-auto pt-12">

      <div className="flex gap-8">
        <SideNav />

        {/* Archivos */}
        <div className="w-full pl-40">
          {children}
        </div>
      </div>
    </main>
  );
}

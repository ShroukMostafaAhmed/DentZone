import { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: 'Edit Area',
  description: 'Edit Area Page'
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster/>
      <SonnerToaster/>
    </>
  );
};

export default Layout;
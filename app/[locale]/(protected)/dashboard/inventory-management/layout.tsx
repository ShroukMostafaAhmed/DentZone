import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Inventory Management',
  description: 'Inventory Management Page'
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

export default Layout;
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Inventory Details',
  description: 'Inventory Details Page'
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

export default Layout;
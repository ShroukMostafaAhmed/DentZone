import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Inventory Managers',
  description: 'Inventory Managers Page'
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

export default Layout;
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Edit Active Ingredient',
  description: 'Edit Active Ingredient Page'
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

export default Layout;
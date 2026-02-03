import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Area Details',
  description: 'Area Details Page'
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

export default Layout;
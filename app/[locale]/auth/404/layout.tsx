import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DrugZA",
  description: "DrugZA Dashboard",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;

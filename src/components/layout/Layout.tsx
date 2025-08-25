import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import MobileQuickActions from "../MobileQuickActions";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>
      <MobileQuickActions />
    </div>
  );
};

export default Layout;
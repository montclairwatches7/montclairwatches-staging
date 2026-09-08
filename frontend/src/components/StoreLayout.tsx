import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { PageLoader } from "@/components/loading";
import { Outlet } from "react-router-dom";

export default function StoreLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}

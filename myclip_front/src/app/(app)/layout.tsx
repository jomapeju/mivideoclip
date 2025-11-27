import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="app-main">
        <div className="app-container py-6 md:py-8">{children}</div>
      </main>
      <Footer />
    </>
  );
}

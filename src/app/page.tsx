import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeContent from "@/components/Hero";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <HomeContent />
      </main>
      <Footer />
    </div>
  );
};

export default Home;

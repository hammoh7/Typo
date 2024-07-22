import Link from 'next/link';
import Head from 'next/head';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <Head>
        <title>Typo</title>
      </Head>
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl">Typing Speed Test</h1>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl mb-4">Welcome to Typing Speed Test</h2>
          <p className="mb-4">Test your typing speed and improve your skills</p>
          <Link href="/test" className="bg-blue-600 text-white py-2 px-4 rounded">
            Start Typing
          </Link>
        </div>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2024 Typing Speed Test. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;

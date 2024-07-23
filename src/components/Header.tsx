import Link from "next/link";

const Header = () => (
  <header className="bg-white shadow-md">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <Link
        href="/"
        className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition duration-300"
      >
        Typo
      </Link>
      <nav>
        <Link
          href="/test"
          className="text-lg font-semibold text-gray-700 hover:text-blue-600 transition duration-300"
        >
          Test Your Speed
        </Link>
      </nav>
    </div>
  </header>
);

export default Header;

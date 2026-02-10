
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          © 2024 CDMA Department. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Personnel Management System v1.0</span>
          <span className="text-gray-300">|</span>
          <a 
            href="https://readdy.ai/?ref=logo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-teal-600 transition-colors cursor-pointer"
          >
            Powered by Readdy
          </a>
        </div>
      </div>
    </footer>
  );
}

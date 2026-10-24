function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 text-gray-400 py-10 px-8">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

        <div className="flex items-center gap-3">

          <img
            src="/logo.png"
            alt="CitiZen"
            className="w-10 h-10"
          />

          <div>

            <h3 className="text-white font-bold text-xl">
              CitiZen
            </h3>

            <p className="text-sm">
              Building Better Cities, Together.
            </p>

          </div>

        </div>

        <div className="text-center md:text-right">

          <p>
            © 2026 CitiZen. All rights reserved.
          </p>

          <p className="text-sm mt-2">
            AI-Powered Civic Intelligence Platform
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;
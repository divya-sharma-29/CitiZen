function SplashScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <h1 className="text-6xl font-bold text-blue-500">
        CitiZen
      </h1>

      <p className="mt-5 text-xl text-gray-300">
        Building Better Cities, Together
      </p>

      <p className="mt-10 text-blue-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
}

export default SplashScreen;
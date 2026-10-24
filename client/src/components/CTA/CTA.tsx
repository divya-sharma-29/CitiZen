import Button from "../Button/Button";

function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 py-28 px-8">

      {/* Background Glow */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-cyan-300/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-5xl mx-auto text-center text-white">

        <p className="uppercase tracking-[0.3em] font-semibold">
          Join the Movement
        </p>

        <h2 className="text-5xl md:text-6xl font-bold mt-6 leading-tight">
          Ready to Build
          <br />
          Better Cities?
        </h2>

        <p className="mt-8 text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-8">
          Every report matters. Help make your city cleaner,
          safer, and smarter with AI-powered civic reporting.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-5">

          <Button
            text="Get Started"
            to="/register"
          />

          <Button
            text="Explore Reports"
            to="/login"
            variant="secondary"
          />

        </div>

      </div>

    </section>
  );
}

export default CTA;
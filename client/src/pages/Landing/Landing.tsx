import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import AIDemo from "../../components/AIDemo/AIDemo";
import Impact from "../../components/Impact/Impact";
import CTA from "../../components/CTA/CTA";
import Footer from "../../components/Footer/Footer";

function Landing() {
  return (
    <div className="min-h-screen">

      <Navbar />

      <main>

        <Hero />

        <Features />

        <HowItWorks />

        <AIDemo />

        <Impact />

        <CTA />

      </main>

      <Footer />

    </div>
  );
}

export default Landing;
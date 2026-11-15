import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import AIDemo from "../../components/AIDemo/AIDemo";
import Impact from "../../components/Impact/Impact";
import CTA from "../../components/CTA/CTA";
import Footer from "../../components/Footer/Footer";
import { apiUrl } from "../../lib/api";
import type { CivicStats } from "../../lib/civicStats";

function Landing() {
  const [stats, setStats] = useState<CivicStats | null>(null);
  const [statsUnavailable, setStatsUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const refreshStats = async () => {
      try {
        const response = await fetch(apiUrl("/api/reports/stats"), {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load civic statistics.");
        }
        if (active) {
          setStats(data as CivicStats);
          setStatsUnavailable(false);
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Civic statistics could not be loaded:", error);
        if (active) {
          setStats(null);
          setStatsUnavailable(true);
        }
      }
    };

    void refreshStats();
    const intervalId = window.setInterval(() => {
      void refreshStats();
    }, 30_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen">

      <Navbar />

      <main>

        <Hero stats={stats} statsUnavailable={statsUnavailable} />

        <Features />

        <HowItWorks />

        <AIDemo stats={stats} statsUnavailable={statsUnavailable} />

        <Impact stats={stats} statsUnavailable={statsUnavailable} />

        <CTA />

      </main>

      <Footer />

    </div>
  );
}

export default Landing;

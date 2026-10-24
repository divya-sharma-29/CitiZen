import FeatureCard from "../FeatureCard/FeatureCard";

function WhyCitizen() {
  return (
    <section className="py-24 bg-gray-100">

      <h2 className="text-5xl font-bold text-center">
        Why CitiZen?
      </h2>

      <div className="grid md:grid-cols-3 gap-10 mt-16 px-12">

        <FeatureCard
          title="Anonymous Reporting"
          description="Citizens can report issues without revealing their identity."
        />

        <FeatureCard
          title="AI Verification"
          description="AI helps detect duplicate or suspicious reports."
        />

        <FeatureCard
          title="Community Impact"
          description="Encourages people to actively improve their surroundings."
        />

      </div>

    </section>
  );
}

export default WhyCitizen;
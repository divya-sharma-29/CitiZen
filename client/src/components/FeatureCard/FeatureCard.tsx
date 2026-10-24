type FeatureCardProps = {
  title: string;
  description: string;
};

function FeatureCard({
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-slate-800">
        {title}
      </h3>

      <p className="text-slate-600 mt-4">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;
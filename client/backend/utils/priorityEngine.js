function calculatePriority({
  category,
  severity = 0,
}) {
  let categoryWeight = 0;

  switch (category) {
    case "Water Leakage":
      categoryWeight = 20;
      break;

    case "Road Damage":
      categoryWeight = 18;
      break;

    case "Drainage":
      categoryWeight = 16;
      break;

    case "Streetlight":
      categoryWeight = 12;
      break;

    case "Garbage":
      categoryWeight = 10;
      break;

    default:
      categoryWeight = 5;
  }

  const score = Math.min(
    100,
    Math.round(
      severity * 0.7 +
      categoryWeight * 0.3
    )
  );

  let level = "Low";

  if (score >= 80) {
    level = "Critical";
  } else if (score >= 60) {
    level = "High";
  } else if (score >= 35) {
    level = "Medium";
  }

  return {
    score,
    level,
  };
}

module.exports = calculatePriority;
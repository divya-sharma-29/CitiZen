import { Link } from "react-router-dom";

type ButtonProps = {
  text: string;
  to: string;
  variant?: "primary" | "secondary";
};

function Button({
  text,
  to,
  variant = "primary",
}: ButtonProps) {
  const styles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white",

    secondary:
      "border border-white text-white hover:bg-white hover:text-black",
  };

  return (
    <Link
      to={to}
      className={`${styles[variant]} px-8 py-3 rounded-xl font-semibold transition`}
    >
      {text}
    </Link>
  );
}

export default Button;
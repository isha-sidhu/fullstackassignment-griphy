import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import Link from "next/link";

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [reconfirmPassword, setReconfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const router = useRouter();

  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.match(emailPattern)) {
      setErrorMessage("Invalid email format.");
      return;
    }

    if (password !== reconfirmPassword) {
      setErrorMessage("Password and Confirm Password do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/home"); // Redirect to dashboard or another page after successful signup
    } catch (error) {
      if (error instanceof FirebaseError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <input
              className="w-full p-2 border rounded-lg"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              className="w-full p-2 border rounded-lg"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              className="w-full p-2 border rounded-lg"
              type="password"
              placeholder="Reconfirm Password"
              value={reconfirmPassword}
              onChange={(e) => setReconfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="w-full bg-gray-800 text-white font-medium p-3 rounded-md"
            type="submit"
          >
            Sign Up
          </button>
        </form>
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
        <nav className="mt-4">
          Already a user?{" "}
          <Link href="/">
            <span className="text-gray-800 underline cursor-pointer">
              Login
            </span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Signup;

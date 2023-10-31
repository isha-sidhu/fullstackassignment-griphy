import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import Link from "next/link";

const SignIn: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

  const navigate = useRouter();

  // Regular expression for email validation
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const processLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!userEmail.match(emailRegex)) {
      setErrorText("Please enter a valid email address.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, userEmail, userPassword);
      navigate.push("/home"); // Navigate to dashboard after successful login
    } catch (error) {
      if (error instanceof FirebaseError) {
        setErrorText(error.message);
      } else {
        setErrorText("Unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 justify-center text-gray-800">
          Hey, Welcome! Sign In
        </h2>
        <form onSubmit={processLogin}>
          <div className="mb-5">
            <input
              className="w-full p-3 border rounded-md"
              type="email"
              placeholder="User Email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-5">
            <input
              className="w-full p-3 border rounded-md"
              type="password"
              placeholder="Password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="w-full bg-gray-800 text-white font-medium p-3 rounded-md"
            type="submit"
          >
            Sign In
          </button>
        </form>
        {errorText && <p className="text-red-600 mt-5">{errorText}</p>}
        <nav className="mt-5">
          Join Us?{" "}
          <Link href="/register">
            <span className="text-gray-800 underline cursor-pointer">
              Register
            </span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default SignIn;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      {/* Theme Toggle in top right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full mix-blend-normal filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-secondary/10 rounded-full mix-blend-normal filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-accent/10 rounded-full mix-blend-normal filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-foreground/5 border border-border p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-3 text-center text-sm text-muted-foreground font-medium">
              Enter your details to access your CoachAssist CRM
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-destructive/10 backdrop-blur-sm border border-destructive/20 text-destructive px-4 py-3 rounded-2xl text-sm font-semibold flex items-center">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}


            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-foreground/80 mb-2 px-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all duration-200 sm:text-sm"
                  placeholder="coach@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>


              <div>
                <label htmlFor="password" className="block text-sm font-bold text-foreground/80 mb-2 px-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all duration-200 sm:text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>


            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Sign In"}
              </button>
            </div>



            <p className="mt-6 text-center text-sm text-muted-foreground font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                Sign up for free
              </Link>
            </p>


          </form>
        </div>
      </div>
    </div>
  );
}

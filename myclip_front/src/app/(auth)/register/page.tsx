"use client";

import RegisterForm from "../../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <section className="flex justify-center items-center min-h-screen">
      <div className="max-w-md w-full p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
        <RegisterForm />
      </div>
    </section>
  );
}

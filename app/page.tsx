import Link from "next/link";

export default function Home() {
  return (
    <div className="flex">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Welcome</h1>
        <p className="mb-6">This Demo is for the MFA Challenge using Supabase Auth.</p>
        

      </div>

      <p className="text-center">
          Already have an account?{" "}
          <Link href="/login" className="font-bold underline">
            Login
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/signup" className="font-bold underline">
            Sign Up
          </Link>
        </p>
    </div>
  );
}

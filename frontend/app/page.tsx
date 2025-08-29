import { FiUser, FiCalendar, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 font-sans">
      {/* Header */}
      <header className="text-center mb-14 mt-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 mb-4 tracking-tight drop-shadow-sm">HealthPal</h1>
        <p className="text-gray-700 text-xl md:text-2xl max-w-2xl mx-auto font-medium">
          A smart hospital appointment booking system that connects Patients, Receptionists, and Doctors seamlessly.
        </p>
      </header>

      {/* How It Works */}
      <section className="grid md:grid-cols-3 gap-10 w-full max-w-6xl px-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center border border-blue-100 hover:shadow-xl transition-all duration-200">
          <FiUser className="mx-auto text-blue-600 text-5xl mb-5" />
          <h2 className="text-2xl font-semibold mb-3 text-blue-900">Patients</h2>
          <p className="text-gray-600 text-base">
            Sign in to the portal, book an appointment, and get matched with the right doctor for your needs.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 text-center border border-blue-100 hover:shadow-xl transition-all duration-200">
          <FiCalendar className="mx-auto text-blue-600 text-5xl mb-5" />
          <h2 className="text-2xl font-semibold mb-3 text-blue-900">Receptionists</h2>
          <p className="text-gray-600 text-base">
            Review patient requests, check doctor availability, and assign a suitable appointment time.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 text-center border border-blue-100 hover:shadow-xl transition-all duration-200">
          <FiCheckCircle className="mx-auto text-blue-600 text-5xl mb-5" />
          <h2 className="text-2xl font-semibold mb-3 text-blue-900">Doctors</h2>
          <p className="text-gray-600 text-base">
            Access appointment lists, manage your schedule, and provide care to patients efficiently.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-16 text-center">
        <p className="text-xl text-blue-800 mb-6 font-medium">
          Ready to get started?
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg shadow-md hover:bg-blue-700 hover:scale-105 transition-all duration-150"
        >
          Sign In to HealthPal
        </Link>
      </section>
    </main>
  );
}

import Link from "next/link";
import { FiCalendar, FiUsers, FiClipboard } from "react-icons/fi";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <span className="text-xl font-bold text-gray-800">HealthPal</span>
        </div>
        <ul className="hidden md:flex space-x-8 text-gray-700 font-medium text-sm">
          <li><a href="#about" className="hover:text-teal-600">About Us</a></li>
          <li><a href="#doctors" className="hover:text-teal-600">Doctors</a></li>
          <li><a href="#treatments" className="hover:text-teal-600">Treatments</a></li>
          <li><a href="#reviews" className="hover:text-teal-600">Reviews</a></li>
          <li><a href="#contact" className="hover:text-teal-600">Contact Us</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between py-16 px-6">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            The hospital you trust to care for those you love
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Best Hospital in Vadodara for Urology and Gynaecology Treatments
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative w-[400px] h-[300px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-teal-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
                <FiUsers className="text-teal-600 text-5xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-4xl mx-auto mb-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-900 rounded-2xl flex flex-col items-center justify-center py-10 text-white">
            <span className="text-4xl font-bold mb-2">500+</span>
            <span className="text-sm opacity-90">Patients Every Day</span>
          </div>
          <div className="bg-blue-900 rounded-2xl flex flex-col items-center justify-center py-10 text-white">
            <span className="text-4xl font-bold mb-2">12+</span>
            <span className="text-sm opacity-90">Years Experience</span>
          </div>
          <div className="bg-blue-900 rounded-2xl flex flex-col items-center justify-center py-10 text-white">
            <span className="text-4xl font-bold mb-2">1000+</span>
            <span className="text-sm opacity-90">Successful Operations</span>
          </div>
        </div>
      </section>

      {/* Passion Section */}
      <section className="max-w-4xl mx-auto text-center mb-16 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Passion for excellence.<br />Compassion for people.
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          As one of the best hospitals in Vadodara we provide Quality Health care with a personal touch.
        </p>
      </section>

      {/* Info Cards */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 px-6">
        <div className="bg-blue-600 text-white rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <FiClipboard className="text-4xl" />
          </div>
          <h3 className="font-bold text-xl mb-3">FOR TREATMENT</h3>
          <p className="text-sm mb-4 opacity-90">
            Get the scheduling & timings of our doctors and book an appointment online at your convenience.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="mb-6">
            <FiCalendar className="text-blue-600 text-4xl" />
          </div>
          <h3 className="font-bold text-xl mb-3 text-gray-900">FOR APPOINTMENT CALL ON</h3>
          <p className="text-sm text-gray-600 mb-2">
            +91 265-2796234 / Call 265 VASCOM Name Prasad & for
          </p>
          <p className="text-xs text-gray-500">Emergency visit the Hospital</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="mb-6">
            <FiUsers className="text-blue-600 text-4xl" />
          </div>
          <h3 className="font-bold text-xl mb-3 text-gray-900">OPD TIMINGS</h3>
          <p className="text-sm text-gray-600 mb-2">
            OPD schedules & timings of OPD medicines as prescribed by our
          </p>
          <p className="text-xs text-gray-500">Specialist Doctor</p>
        </div>
      </section>

      {/* CTA Button */}
      <div className="flex justify-center pb-16">
        <Link
          href="/login"
          className="px-10 py-4 rounded-lg bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
        >
          Book Now
        </Link>
      </div>
    </main>
  );
}
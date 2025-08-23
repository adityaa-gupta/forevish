import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  ArrowRight,
  Send,
  User,
  Users,
} from "lucide-react";
import ContactForm from "../components/ContactForm";

export const metadata = {
  title: "Contact • Forevish",
  description:
    "Get in touch with Forevish. Find our email, phone, hours, and address, or raise a query via the contact form.",
};

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 left-0 w-full h-[800px] bg-[radial-gradient(70%_60%_at_50%_10%,#EBF5FF_5%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute top-1/4 right-0 w-72 h-72 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 rounded-full bg-pink-50/40 blur-3xl" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-50/50 to-transparent" />
      </div>

      {/* Hero section */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700">
            <MessageSquare className="h-3 w-3" />
            Get in touch
          </span>

          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Let's talk<span className="text-blue-600">.</span>
          </h1>

          <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-600">
            We're here to answer your questions, address your concerns, and make
            your shopping experience delightful.
          </p>

          {/* Fancy separator */}
          <div className="flex items-center justify-center my-12">
            <div className="h-px w-12 bg-gray-200"></div>
            <div className="mx-4">
              <div className="w-2 h-2 rotate-45 bg-blue-600"></div>
            </div>
            <div className="h-px w-12 bg-gray-200"></div>
          </div>
        </div>
      </section>

      {/* Main content area */}
      <section className="relative px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Contact cards */}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">
                Connect with us
              </h2>

              {/* Contact cards in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ContactCard
                  icon={<Mail className="h-6 w-6 text-blue-500" />}
                  title="Email"
                  description="We aim to respond within 24 hours during business days."
                >
                  <a
                    href="mailto:Info.forevish@gmail.com"
                    className="group flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
                  >
                    Info.forevish@gmail.com
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </ContactCard>

                <ContactCard
                  icon={<User className="h-6 w-6 text-blue-500" />}
                  title="Founder"
                  description="Get in touch with our founder directly."
                >
                  <p className="text-gray-700">Neeraj Garg</p>
                  <a
                    href="tel:+919785895166"
                    className="group flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 mt-1"
                  >
                    +91 97858 95166
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </ContactCard>

                <ContactCard
                  icon={<Users className="h-6 w-6 text-blue-500" />}
                  title="Co-Founder"
                  description="Connect with our co-founder."
                >
                  <p className="text-gray-700">Karishma Modi</p>
                  <a
                    href="tel:+918949469355"
                    className="group flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 mt-1"
                  >
                    +91 89494 69355
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </ContactCard>

                <ContactCard
                  icon={<Clock className="h-6 w-6 text-blue-500" />}
                  title="Business Hours"
                  description="We're available during these hours."
                >
                  <p className="text-gray-700">Mon–Sat, 10:00–18:00 IST</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Closed on public holidays
                  </p>
                </ContactCard>
              </div>

              {/* Address card */}
              <div className="mt-6">
                <ContactCard
                  icon={<MapPin className="h-6 w-6 text-blue-500" />}
                  title="Studio Address"
                  description="Visit our studio by appointment only."
                >
                  <p className="text-gray-700">118, Lal Ji Sand Ka Rasta,</p>
                  <p className="text-gray-700">Jaipur, Rajasthan, India</p>
                </ContactCard>
              </div>

              {/* FAQ redirect */}
              <div className="mt-10 p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl shadow-sm">
                <h3 className="font-medium text-gray-900">
                  Have a common question?
                </h3>
                <p className="mt-1 text-gray-600 text-sm">
                  Our FAQ section covers shipping, returns, size guides, and
                  more.
                </p>
                <Link
                  href="/faq"
                  className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Browse FAQ
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right: Contact form */}
            <div>
              <div className="relative">
                {/* Form card with gradient border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 blur-[2px]"></div>
                <div className="relative rounded-3xl bg-white p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Send className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Send a message
                      </h2>
                      <p className="text-sm text-gray-600">
                        We'll get back to you as soon as possible
                      </p>
                    </div>
                  </div>

                  {/* The form component */}
                  <ContactForm />

                  {/* Support policy */}
                  <div className="mt-6 text-xs text-gray-500 flex items-start gap-2">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-medium">
                        i
                      </span>
                    </div>
                    <p>
                      By submitting this form, you agree to our{" "}
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/term-and-conditions"
                        className="text-blue-600 hover:underline"
                      >
                        Terms & Conditions
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map section */}
      <section className="relative px-6 pb-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Visit our studio
            </h2>
            <p className="mt-2 text-gray-600">
              Our flagship location in Jaipur, the Pink City of India
            </p>
          </div>

          <div className="aspect-[16/9] w-full overflow-hidden rounded-3xl shadow-lg">
            <iframe
              title="Forevish Studio Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.0117068882207!2d75.81691071194777!3d26.896479876856302!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db6af4b837bfb%3A0x6798f0c9e6dbf5b7!2s118%2C%20Lal%20Ji%20Sand%20Ka%20Rasta%2C%20Jaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1724090001568!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactCard({ icon, title, description, children }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      </div>

      <div className="mb-3">{children}</div>

      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

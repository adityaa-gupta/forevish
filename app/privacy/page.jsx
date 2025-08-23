import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  User,
  Cookie,
  Share2,
  KeyRound,
  Database,
  Globe,
  CalendarDays,
  Mail,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Privacy Policy • Forevish",
  description:
    "Learn how Forevish collects, uses, protects, and shares your information. Read about cookies, your rights, and how to contact us.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Enhanced background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-violet-100/60 via-purple-50/40 to-transparent" />
        <div className="absolute -top-32 right-[-15%] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,69,193,0.15),transparent_70%)] blur-3xl" />
        <div className="absolute -top-20 left-[-15%] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.08),transparent_70%)] blur-2xl" />
      </div>

      {/* Enhanced Hero */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-200/70 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          Legal Documentation
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          Privacy Policy
        </div>

        <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-violet-900 via-purple-800 to-violet-700">
          Privacy Policy
        </h1>
        <p className="mt-4 inline-flex items-center gap-2.5 text-base text-violet-700/90 font-medium">
          <CalendarDays className="h-5 w-5" />
          Last Updated: May 3, 2025
        </p>

        {/* Enhanced Mobile TOC chips */}
        <nav
          aria-label="On this page"
          className="mt-8 -mx-1 overflow-x-auto lg:hidden"
        >
          <ul className="flex gap-3 px-1 pb-2">
            <TOCChip href="#about">About Forevish</TOCChip>
            <TOCChip href="#info-we-collect">1. Information We Collect</TOCChip>
            <TOCChip href="#how-we-use">2. How We Use Info</TOCChip>
            <TOCChip href="#cookies">3. Cookies</TOCChip>
            <TOCChip href="#sharing">4. Sharing</TOCChip>
            <TOCChip href="#security-retention">
              5. Security & Retention
            </TOCChip>
            <TOCChip href="#your-rights">6. Your Rights</TOCChip>
            <TOCChip href="#children">7. Children</TOCChip>
            <TOCChip href="#transfers">8. International</TOCChip>
            <TOCChip href="#updates">9. Updates</TOCChip>
            <TOCChip href="#contact">10. Contact</TOCChip>
          </ul>
        </nav>
      </header>

      {/* Enhanced Content grid */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Enhanced Sticky TOC (desktop) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl shadow-violet-500/10 ring-1 ring-violet-100/50 p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-violet-900/90 mb-4">
                On this page
              </p>
              <nav className="space-y-2 text-sm">
                <TOCItem href="#about" label="About Forevish" />
                <TOCItem
                  href="#info-we-collect"
                  label="1. Information We Collect"
                />
                <TOCItem href="#how-we-use" label="2. How We Use Information" />
                <TOCItem href="#cookies" label="3. Cookies & Tracking" />
                <TOCItem href="#sharing" label="4. Sharing of Information" />
                <TOCItem
                  href="#security-retention"
                  label="5. Security & Retention"
                />
                <TOCItem href="#your-rights" label="6. Your Choices & Rights" />
                <TOCItem href="#children" label="7. Children's Privacy" />
                <TOCItem href="#transfers" label="8. International Transfers" />
                <TOCItem href="#updates" label="9. Updates to this Policy" />
                <TOCItem href="#contact" label="10. Contact Us" />
              </nav>
            </div>
          </aside>

          {/* Enhanced Main article */}
          <article className="lg:col-span-8 xl:col-span-9 space-y-8">
            <Section
              id="about"
              number=""
              title="About Forevish"
              icon={ShieldCheck}
            >
              <div className="space-y-6 text-violet-900/90">
                <h3 className="text-2xl font-bold text-violet-950 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Young. Stylish. Modern.
                </h3>
                <p className="text-lg leading-relaxed">
                  Forevish is a women's clothing brand that celebrates the
                  spirit of today's Indian woman—free, independent, and
                  effortlessly fashionable. Our collections bring together the
                  best of ethnic and fusion wear, thoughtfully curated to stay
                  in tune with global trends while keeping comfort at heart.
                </p>
                <h4 className="pt-4 text-base font-bold tracking-wide text-violet-900 uppercase">
                  Our Philosophy
                </h4>
                <p className="leading-relaxed">
                  We believe in stories over seasons, personal style over
                  passing trends, and comfort over appearance. Every design is
                  an expression of individuality, meant to be worn your way.
                </p>
                <h4 className="pt-4 text-base font-bold tracking-wide text-violet-900 uppercase">
                  Our Forte
                </h4>
                <p className="leading-relaxed">
                  Kurtas are at the core of what we do, paired with a wide range
                  of bottoms and dupattas—giving you endless ways to mix, match,
                  and create your perfect ensemble.
                </p>
                <p className="pt-2 text-lg font-medium text-violet-800">
                  At Forevish, fashion isn't just what you wear. It's how you
                  feel—forever stylish, forever you.
                </p>
              </div>
            </Section>

            <Section
              id="info-we-collect"
              number="1"
              title="Information We Collect"
              icon={Database}
            >
              <ul className="list-disc pl-6 space-y-3 text-base leading-relaxed">
                <li>
                  Personal details: name, email, phone number, shipping/billing
                  address, and preferences.
                </li>
                <li>
                  Order and payment information: items purchased, transaction
                  identifiers, and payment status. We do not store full card
                  details; payments are processed by secure third‑party
                  providers.
                </li>
                <li>
                  Account information: login method, wishlist, cart, reviews,
                  and communication preferences.
                </li>
                <li>
                  Usage data: device type, browser, IP, pages viewed, session
                  duration, and interactions, collected via analytics tools.
                </li>
                <li>Cookies and similar technologies as described below.</li>
              </ul>
            </Section>

            <Section
              id="how-we-use"
              number="2"
              title="How We Use Information"
              icon={KeyRound}
            >
              <ul className="list-disc pl-6 space-y-3 text-base leading-relaxed">
                <li>
                  To process orders, payments, returns, and provide customer
                  support.
                </li>
                <li>
                  To personalize content, remember preferences, and improve our
                  products.
                </li>
                <li>
                  To send transactional emails and, with consent where required,
                  marketing updates.
                </li>
                <li>
                  To prevent fraud, secure our Services, and comply with legal
                  obligations.
                </li>
              </ul>
            </Section>

            <Section
              id="cookies"
              number="3"
              title="Cookies & Tracking"
              icon={Cookie}
            >
              <ul className="list-disc pl-6 space-y-3 text-base leading-relaxed">
                <li>
                  Essential cookies for site functionality (cart, checkout,
                  authentication).
                </li>
                <li>
                  Analytics cookies to understand performance and improve
                  experience.
                </li>
                <li>
                  Marketing cookies (if used) to deliver relevant offers. You
                  can manage cookies in your browser settings and opt out of
                  non‑essential cookies where available.
                </li>
              </ul>
            </Section>

            <Section
              id="sharing"
              number="4"
              title="How We Share Information"
              icon={Share2}
            >
              <ul className="list-disc pl-6 space-y-3 text-base leading-relaxed">
                <li>
                  Service providers: payment gateways, shipping partners,
                  analytics, and customer support tools—strictly to perform
                  services on our behalf.
                </li>
                <li>
                  Legal and safety: to comply with law, enforce our terms, or
                  protect our rights and users.
                </li>
                <li>
                  Business transfers: in connection with a merger, acquisition,
                  or asset sale, subject to confidentiality.
                </li>
              </ul>
            </Section>

            <Section
              id="security-retention"
              number="5"
              title="Security & Data Retention"
              icon={Lock}
            >
              <ul className="list-disc pl-6 space-y-3 text-base leading-relaxed">
                <li>
                  We use technical and organizational safeguards to protect your
                  data.
                </li>
                <li>
                  We retain information only as long as necessary for the
                  purposes described in this Policy or as required by law.
                </li>
              </ul>
            </Section>

            <Section
              id="your-rights"
              number="6"
              title="Your Choices & Rights"
              icon={User}
            >
              <ul className="list-disc pl-6 space-y-3 text-base leading-relaxed">
                <li>
                  Access, update, or delete your account information from your
                  profile.
                </li>
                <li>
                  Opt out of marketing communications at any time via the email
                  footer or your account settings. Transactional messages will
                  still be sent.
                </li>
                <li>
                  You may request a copy of your data or ask us to
                  restrict/obect to certain processing where applicable by law.
                </li>
              </ul>
            </Section>

            <Section
              id="children"
              number="7"
              title="Children's Privacy"
              icon={ShieldCheck}
            >
              <p className="text-base leading-relaxed">
                Our Services are not directed to individuals under 13. We do not
                knowingly collect personal information from children. If you
                believe a child has provided information, please contact us and
                we will take appropriate steps to delete it.
              </p>
            </Section>

            <Section
              id="transfers"
              number="8"
              title="International Transfers"
              icon={Globe}
            >
              <p className="text-base leading-relaxed">
                We may process information in countries other than where you
                reside. When we transfer data, we use safeguards consistent with
                applicable law to protect your information.
              </p>
            </Section>

            <Section
              id="updates"
              number="9"
              title="Updates to this Policy"
              icon={CalendarDays}
            >
              <p className="text-base leading-relaxed">
                We may update this Privacy Policy to reflect changes to our
                practices or for legal reasons. We will post the updated date at
                the top of this page. Continued use of the Site after changes
                means you accept the updated Policy.
              </p>
            </Section>

            <Section id="contact" number="10" title="Contact Us" icon={Mail}>
              <p className="text-base leading-relaxed">
                For questions, requests, or complaints about this Policy,
                contact{" "}
                <Link
                  href="/contact"
                  className="text-violet-700 hover:text-violet-800 hover:underline font-semibold transition-colors"
                >
                  Forevish Support
                </Link>
                . We aim to respond promptly and resolve concerns fairly.
              </p>
            </Section>

            <Card>
              <p className="text-base text-violet-700/90">
                Looking for our Terms?{" "}
                <Link
                  href="/terms"
                  className="text-violet-700 font-semibold hover:text-violet-800 hover:underline transition-colors"
                >
                  Read Terms & Conditions
                </Link>
                .
              </p>
            </Card>
          </article>
        </div>
      </section>
    </main>
  );
}

/* Enhanced UI helpers */

function Card({ children }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl shadow-violet-500/10 ring-1 ring-violet-100/50 p-8">
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-32 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(139,69,193,0.12),transparent)]" />
      {children}
    </div>
  );
}

function Section({ id, number, title, icon: Icon, children }) {
  return (
    <section id={id} className="scroll-mt-32">
      <div className="group relative rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl shadow-violet-500/10 ring-1 ring-violet-100/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/15">
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-3xl bg-gradient-to-b from-violet-500 via-purple-500 to-violet-400" />
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            {number ? (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 ring-1 ring-violet-200/50 text-base font-bold shadow-sm">
                {number}
              </span>
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 ring-1 ring-violet-200/50 shadow-sm">
                <Icon className="h-6 w-6" />
              </span>
            )}
            <div className="flex items-center gap-3">
              {number && <Icon className="h-6 w-6 text-violet-600" />}
              <h2 className="text-2xl font-bold text-violet-950">{title}</h2>
            </div>
          </div>
          <div className="text-violet-900/90 leading-relaxed">{children}</div>
        </div>
      </div>
    </section>
  );
}

function TOCChip({ href, children }) {
  return (
    <li>
      <a
        href={href}
        className="whitespace-nowrap rounded-full border border-violet-200/70 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-2 text-sm font-medium text-violet-800 hover:from-violet-100 hover:to-purple-100 hover:border-violet-300/70 transition-all duration-200 shadow-sm"
      >
        {children}
      </a>
    </li>
  );
}

function TOCItem({ href, label }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-xl px-4 py-3 text-violet-800 hover:text-violet-900 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 border border-transparent hover:border-violet-200/50 transition-all duration-200 group"
    >
      <span className="font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
    </a>
  );
}

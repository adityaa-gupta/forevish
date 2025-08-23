import Link from "next/link";
import {
  CalendarDays,
  ShieldCheck,
  Package,
  CreditCard,
  Truck,
  RefreshCcw,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export const metadata = {
  title: "Terms & Conditions • Forevish",
  description:
    "Read the Terms & Conditions for using Forevish, including orders, pricing, payments, shipping, and returns.",
};

export default function TermsAndConditionsPage() {
  return (
    <main id="top" className="min-h-screen bg-background">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-muted/30" />
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-accent/10 via-accent/5 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-accent bg-accent/10 border border-accent/20 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              Legal Documentation
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-4">
              Terms & <span className="text-accent">Conditions</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Clear, transparent terms that protect both you and us. Updated
              regularly to reflect our commitment to fair practices.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="w-4 h-4" />
              Last Updated: May 3, 2025
            </div>
          </div>

          <nav aria-label="On this page" className="mt-12">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                Quick Navigation
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <TOCChip href="#eligibility" icon={ShieldCheck}>
                  1. Eligibility
                </TOCChip>
                <TOCChip href="#products-orders" icon={Package}>
                  2. Products & Orders
                </TOCChip>
                <TOCChip href="#pricing-payments" icon={CreditCard}>
                  3. Pricing & Payments
                </TOCChip>
                <TOCChip href="#shipping-delivery" icon={Truck}>
                  4. Shipping & Delivery
                </TOCChip>
                <TOCChip href="#returns-exchanges" icon={RefreshCcw}>
                  5. Returns & Exchanges
                </TOCChip>
              </ul>
            </div>
          </nav>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="space-y-12">
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Welcome to Forevish
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Forevish ("we", "our", "us"). These Terms &
                  Conditions ("Terms") govern your use of our website{" "}
                  <span className="font-medium text-accent">
                    www.forevish.com
                  </span>{" "}
                  (the "Site") and any purchases or services offered through it
                  (collectively, the "Services").
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  By accessing or using our Site, you agree to be bound by these
                  Terms. If you do not agree, please do not use our Services.
                </p>
              </div>
            </div>
          </Card>

          <Section
            id="eligibility"
            icon={ShieldCheck}
            number="1"
            title="Eligibility"
            accent
          >
            <p className="text-muted-foreground leading-relaxed">
              You must be at least{" "}
              <span className="font-semibold text-accent">18 years</span> old to
              make a purchase from Forevish. By using our Services, you confirm
              that you meet this requirement and have the legal capacity to
              enter into binding agreements.
            </p>
          </Section>

          <Section
            id="products-orders"
            icon={Package}
            number="2"
            title="Products & Orders"
          >
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  All products listed on the Site are subject to availability
                  and may be discontinued without notice.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  We strive to display product colors and details accurately,
                  but variations may occur due to screen differences and
                  manufacturing processes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  We reserve the right to limit or cancel orders at our
                  discretion, including those with incorrect pricing or
                  suspicious activity.
                </span>
              </li>
            </ul>
          </Section>

          <Section
            id="pricing-payments"
            icon={CreditCard}
            number="3"
            title="Pricing & Payments"
          >
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  All prices are listed in{" "}
                  <span className="font-semibold text-accent">INR (₹)</span>{" "}
                  unless otherwise specified.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  Prices may change at any time without prior notice, but
                  changes will not affect orders already placed.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  Payments must be made using the secure methods provided at
                  checkout.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  By providing payment information, you confirm that you are
                  authorized to use the chosen payment method.
                </span>
              </li>
            </ul>
          </Section>

          <Section
            id="shipping-delivery"
            icon={Truck}
            number="4"
            title="Shipping & Delivery"
          >
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  We ship across India and select international locations as
                  specified on the Site.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  Delivery timelines are estimates and may vary based on your
                  location, courier delays, or other factors beyond our control.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  Once your order is shipped, Forevish is not responsible for
                  delays or issues caused by third‑party couriers.
                </span>
              </li>
            </ul>
          </Section>

          <Section
            id="returns-exchanges"
            icon={RefreshCcw}
            number="5"
            title="Returns & Exchanges"
          >
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  We accept returns/exchanges within{" "}
                  <span className="font-semibold text-accent">14 days</span> of
                  delivery, subject to our{" "}
                  <Link
                    href="/return-policy"
                    className="text-accent hover:underline font-medium"
                  >
                    Return Policy
                  </Link>
                  .
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  Products must be unused, unwashed, and in original packaging
                  with all tags attached.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  Certain items (e.g., sale items, accessories, or custom
                  orders) may not be eligible for return.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  Refunds will be processed back to the original payment method
                  within 5-7 business days.
                </span>
              </li>
            </ul>
          </Section>

          <div className="space-y-8">
            <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-background border-accent/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Questions about these Terms?
                  </h3>
                  <p className="text-muted-foreground">
                    Our support team is here to help clarify any questions you
                    may have.{" "}
                    <Link
                      href="/contact"
                      className="text-accent font-medium hover:underline"
                    >
                      Contact support
                    </Link>
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                © 2025 Forevish. All rights reserved.
              </div>
              <a
                href="#top"
                className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                aria-label="Back to top"
              >
                Back to top ↑
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* Enhanced UI components with modern styling and semantic tokens */

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-sm p-8 ${className}`}
    >
      {children}
    </div>
  );
}

function TOCChip({ href, children, icon: Icon }) {
  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/20 transition-all duration-200 text-sm font-medium text-foreground group"
      >
        <Icon className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
        <span className="whitespace-nowrap">{children}</span>
      </a>
    </li>
  );
}

function Section({ id, icon: Icon, number, title, children, accent = false }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${
            accent
              ? "bg-accent text-accent-foreground"
              : "bg-accent/10 text-accent"
          }`}
        >
          {number}
        </div>
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
      </div>
      <Card
        className={
          accent
            ? "border-accent/20 bg-gradient-to-br from-accent/5 to-background"
            : ""
        }
      >
        {children}
      </Card>
    </section>
  );
}

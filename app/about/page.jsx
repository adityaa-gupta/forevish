export const metadata = {
  title: "About Us",
  description:
    "Learn about Forevish – premium tailored women's professional wear crafted for confidence, quality and sustainability.",
};

export default function AboutPage() {
  const stats = [
    { label: "Products Crafted", value: "120+" },
    { label: "Happy Customers", value: "5K+" },
    { label: "Return Rate", value: "<2%" },
    { label: "Sustainably Sourced", value: "92%" },
  ];

  const values = [
    {
      title: "Tailored Excellence",
      body: "Meticulous construction, precision cuts, and enduring fabrics designed to empower every day.",
      icon: "✂️",
    },
    {
      title: "Sustainability",
      body: "Low-impact materials, responsible suppliers, and iterative improvements toward circular fashion.",
      icon: "🌿",
    },
    {
      title: "Customer Obsession",
      body: "Feedback loops shape our iterations—fit refinements, fabric upgrades, and service enhancements.",
      icon: "💬",
    },
    {
      title: "Timeless Design",
      body: "Pieces that outlast trends—versatile silhouettes you can re-style season after season.",
      icon: "🕰️",
    },
  ];

  const timeline = [
    {
      year: "2023",
      title: "Concept & Prototype",
      body: "Founder sketches first capsule of 6 core pieces.",
    },
    {
      year: "2024 Q1",
      title: "Soft Launch",
      body: "Private beta with early professionals across 3 cities.",
    },
    {
      year: "2024 Q3",
      title: "Public Launch",
      body: "Introduced expanded size grid & color variants.",
    },
    {
      year: "2025",
      title: "Sustainability Push",
      body: "Transitioned majority of lining fabrics to recycled blends.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      {/* Decorative */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[70rem] h-64 bg-gradient-to-r from-pink-100/50 via-blue-100/40 to-emerald-100/50 blur-3xl opacity-60" />
      </div>

      <header className="max-w-5xl mx-auto px-5 pt-20 pb-12 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-neutral-900 text-white text-xs tracking-wide">
          About Forevish
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 leading-tight">
          Modern tailoring for{" "}
          <span className="bg-gradient-to-r from-neutral-900 to-neutral-500 bg-clip-text text-transparent">
            ambitious women
          </span>
        </h1>
        <p className="mt-6 text-neutral-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          We design elevated, functional, and enduring professional pieces—
          merging couture-inspired structure with adaptive comfort to help you
          move, lead, and create with confidence.
        </p>
      </header>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-5 mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur p-6 text-center shadow-sm"
            >
              <p className="text-2xl font-bold tracking-tight text-neutral-900">
                {s.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About Forevish (new) */}
      <section className="max-w-6xl mx-auto px-5 mb-24">
        <div className="rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur p-8 sm:p-10 shadow-sm">
          <span className="inline-block px-4 py-1.5 rounded-full bg-neutral-900 text-white text-xs tracking-wide">
            About Forevish
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Young. Stylish. Modern.
          </h2>
          <div className="mt-4 space-y-4 text-neutral-600 text-sm leading-relaxed">
            <p>
              Forevish is a women’s clothing brand that celebrates the spirit of
              today’s Indian woman—free, independent, and effortlessly
              fashionable. Our collections bring together the best of ethnic and
              fusion wear, thoughtfully curated to stay in tune with global
              trends while keeping comfort at heart.
            </p>

            <h3 className="pt-4 text-sm font-semibold tracking-wide text-neutral-800 uppercase">
              Our Philosophy
            </h3>
            <p>
              We believe in stories over seasons, personal style over passing
              trends, and comfort over appearance. Every design is an expression
              of individuality, meant to be worn your way.
            </p>

            <h3 className="pt-4 text-sm font-semibold tracking-wide text-neutral-800 uppercase">
              Our Forte
            </h3>
            <p>
              Kurtas are at the core of what we do, paired with a wide range of
              bottoms and dupattas—giving you endless ways to mix, match, and
              create your perfect ensemble.
            </p>

            <p className="pt-2">
              At Forevish, fashion isn’t just what you wear. It’s how you
              feel—forever stylish, forever you.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-6xl mx-auto px-5 mb-24 grid lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Our Story
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Forevish began with a simple observation: professional attire often
            forced a compromise between structure, comfort, or authenticity. We
            set out to build a system of refined wardrobe essentials that adapt
            to real momentum—boardrooms, brainstorming sessions, red-eye travel,
            and everything between.
          </p>
          <p className="text-neutral-600 text-sm leading-relaxed">
            We source responsibly, test wearability under real conditions, and
            iterate relentlessly based on feedback from a growing community of
            founders, engineers, consultants, designers, and creators.
          </p>
          <p className="text-neutral-600 text-sm leading-relaxed">
            Each new release earns its place through utility, longevity, and
            aesthetic clarity—never novelty for novelty’s sake.
          </p>
        </div>
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-100">
            <img
              src="https://images.unsplash.com/photo-1743708825990-5ee3b68d82e2?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Tailoring studio"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-48 rounded-2xl overflow-hidden border border-neutral-200 shadow bg-white">
            <img
              src="https://images.unsplash.com/photo-1562505208-0b9bad881640?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Fabric details"
              className="h-32 w-full object-cover"
              loading="lazy"
            />
            <div className="p-3">
              <p className="text-[11px] text-neutral-500 leading-snug">
                Precision finishing &amp; tactile fabric evolution drive
                durability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-5 mb-24">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-10">
          What We Value
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="group relative rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition"
            >
              <div className="text-2xl">{v.icon}</div>
              <h3 className="text-sm font-semibold tracking-wide text-neutral-800 uppercase">
                {v.title}
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600">
                {v.body}
              </p>
              <span className="absolute inset-0 rounded-2xl pointer-events-none ring-0 group-hover:ring-2 ring-neutral-900/5 transition" />
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-6xl mx-auto px-5 mb-28">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-10">
          Journey & Milestones
        </h2>
        <ol className="relative border-l border-neutral-200 pl-6 space-y-10">
          {timeline.map((t, i) => (
            <li key={t.year} className="relative">
              <span className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-neutral-900 text-white text-[11px] font-semibold flex items-center justify-center shadow">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  {t.year}
                </p>
                <h3 className="text-sm font-semibold text-neutral-900">
                  {t.title}
                </h3>
                <p className="text-xs leading-relaxed text-neutral-600 max-w-md">
                  {t.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-5 mb-24">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-10 sm:p-14">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_40%,#ffffff40,transparent)]" />
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            Build your signature rotation
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 max-w-xl mb-8 leading-relaxed">
            Explore structured silhouettes, adaptive fabrics, and future-proof
            essentials engineered to work as hard as you do.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/shop/new"
              className="inline-flex items-center justify-center rounded-xl bg-white text-neutral-900 text-sm font-medium px-6 py-3 hover:bg-neutral-100 transition shadow-sm"
            >
              Browse New Arrivals
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 text-white text-sm font-medium px-6 py-3 hover:bg-white/10 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

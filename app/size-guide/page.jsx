import Link from "next/link";

export const metadata = {
  title: "Size Guide • Laal Ishq Suit Set • Forevish",
  description:
    "Size chart for the Laal Ishq Suit Set. Find measurements for Kurta, Palazzo/Bottom, and Top across sizes XS–4XL.",
};

export default function SizeGuidePage() {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

  const kurta = [
    { label: "Chest", values: [34, 36, 38, 40, 42, 44, 46, 48] },
    { label: "Waist", values: [32, 34, 36, 38, 40, 42, 44, 46] },
    { label: "Hip", values: [36, 38, 40, 42, 44, 46, 48, 50] },
    { label: "Shoulder", values: [13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17] },
    { label: "Armhole", values: [17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5] },
  ];

  const palazzo = [
    { label: "Waist", values: [26, 28, 30, 32, 34, 36, 38, 40] },
    { label: "Hip", values: [38, 38, 40, 42, 44, 44, 48, 50] },
  ];

  const top = [
    { label: "Chest", values: [34, 36, 38, 40, 42, 44, 46, 48] },
    { label: "Waist", values: [30, 32, 34, 36, 38, 40, 42, 44] },
  ];

  const toCSV = (rows) => {
    const header = ["Sizes", ...sizes].join(",");
    const lines = rows.map((r) => [r.label, ...r.values].join(","));
    return [header, ...lines].join("\n");
  };

  const csvLinks = {
    kurta: `data:text/csv;charset=utf-8,${encodeURIComponent(toCSV(kurta))}`,
    palazzo: `data:text/csv;charset=utf-8,${encodeURIComponent(
      toCSV(palazzo)
    )}`,
    top: `data:text/csv;charset=utf-8,${encodeURIComponent(toCSV(top))}`,
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-violet-100/60 via-purple-50/40 to-transparent" />
        <div className="absolute -top-32 right-[-15%] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,69,193,0.15),transparent_70%)] blur-3xl" />
        <div className="absolute -top-20 left-[-15%] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.08),transparent_70%)] blur-2xl" />
      </div>

      <header className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200/60 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-violet-500"></div>
          <span className="text-violet-800 text-sm font-semibold">
            Size Guide
          </span>
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-violet-900 via-purple-800 to-violet-700">
          Forevish Suits Size Chart
        </h1>
        <p className="mt-4 text-lg text-violet-700/80 max-w-2xl">
          All measurements are in inches. Consider a 0.5–1 inch allowance for
          comfort.
        </p>
      </header>

      {/* Content */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-16 space-y-8">
        <TableCard
          title="Kurta"
          note="Classic straight-fit kurta measurements."
          sizes={sizes}
          rows={kurta}
          downloadHref={csvLinks.kurta}
          downloadName="laal-ishq-kurta-size-chart.csv"
        />
        <TableCard
          title="Palazzo / Bottom"
          note="Elasticated waistband measurements."
          sizes={sizes}
          rows={palazzo}
          downloadHref={csvLinks.palazzo}
          downloadName="laal-ishq-palazzo-size-chart.csv"
        />
        <TableCard
          title="Top"
          note="Structured top measurements."
          sizes={sizes}
          rows={top}
          downloadHref={csvLinks.top}
          downloadName="laal-ishq-top-size-chart.csv"
        />

        <div className="rounded-3xl bg-gradient-to-r from-violet-100/60 to-purple-100/40 backdrop-blur-sm shadow-lg shadow-violet-100/50 ring-1 ring-violet-200/40 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/10 mb-4">
            <svg
              className="w-6 h-6 text-violet-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg text-violet-900/90 font-medium">
            Need help picking a size?{" "}
            <Link
              href="/contact"
              className="text-violet-700 font-bold hover:text-violet-800 underline decoration-violet-300 hover:decoration-violet-500 transition-colors duration-200"
            >
              Talk to our stylist
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

function TableCard({ title, note, sizes, rows, downloadHref, downloadName }) {
  return (
    <div className="group relative rounded-3xl bg-white/80 backdrop-blur-sm shadow-lg shadow-violet-100/50 ring-1 ring-violet-200/40 p-6 sm:p-8 hover:shadow-xl hover:shadow-violet-200/30 transition-all duration-300">
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-3xl bg-gradient-to-b from-violet-500 via-purple-500 to-violet-400 shadow-lg shadow-violet-500/30" />

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-violet-950 mb-2">
            {title}
          </h2>
          {note && <p className="text-sm text-violet-700/70">{note}</p>}
        </div>
        <a
          href={downloadHref}
          download={downloadName}
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-800 bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200/60 rounded-full px-4 py-2.5 hover:from-violet-200 hover:to-purple-200 hover:border-violet-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Download CSV
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </a>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-violet-100/60 bg-gradient-to-br from-white to-violet-50/30">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{title} size chart</caption>
          <thead>
            <tr className="bg-gradient-to-r from-violet-100/80 to-purple-100/60">
              <th className="sticky left-0 z-10 bg-gradient-to-r from-violet-100/80 to-purple-100/60 text-left font-bold text-violet-900 border-b border-violet-200/60 px-4 py-4 rounded-tl-2xl">
                Measure
              </th>
              {sizes.map((s, index) => (
                <th
                  key={s}
                  className={`text-center font-bold text-violet-900 border-b border-violet-200/60 px-4 py-4 ${
                    index === sizes.length - 1 ? "rounded-tr-2xl" : ""
                  }`}
                >
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, rowIndex) => (
              <tr
                key={r.label}
                className="hover:bg-violet-50/40 transition-colors duration-150"
              >
                <th className="sticky left-0 z-10 bg-white/90 backdrop-blur-sm text-violet-900 font-semibold border-b border-violet-100/60 px-4 py-3">
                  {r.label}
                </th>
                {r.values.map((v, i) => (
                  <td
                    key={`${r.label}-${i}`}
                    className="border-b border-violet-100/60 px-4 py-3 text-center text-violet-800 font-medium"
                  >
                    {v}"
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

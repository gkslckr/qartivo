const features = [
  {
    icon: "▣",
    title: "Digitales QR-Menü",
    description:
      "Ihre Speisekarte digital, modern und jederzeit aktualisierbar.",
  },
  {
    icon: "★",
    title: "Google Bewertungen",
    description:
      "Gäste direkt zur Google-Bewertung führen und mehr Bewertungen sammeln.",
  },
  {
    icon: "⌁",
    title: "NFC & QR",
    description:
      "Eine Karte für alle wichtigen digitalen Touchpoints Ihres Restaurants.",
  },
  {
    icon: "↗",
    title: "Mehr Kontrolle",
    description:
      "Verwalten Sie Inhalte, Angebote und Restaurantdaten zentral in Qartivo.",
  },
];

const steps = [
  {
    number: "01",
    title: "Registrieren",
    description: "Konto erstellen und Restaurant hinzufügen.",
  },
  {
    number: "02",
    title: "Einrichten",
    description: "Menü, Bilder und Restaurantinformationen eintragen.",
  },
  {
    number: "03",
    title: "QR-Code teilen",
    description: "QR-Code auf Tischen, Karten oder Schildern einsetzen.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "0",
    description: "Für Restaurants, die Qartivo kennenlernen möchten.",
    features: ["Digitales Menü", "QR-Code", "Restaurantprofil"],
    featured: false,
  },
  {
    name: "Pro",
    price: "19",
    description: "Für Restaurants, die digital wachsen möchten.",
    features: [
      "Alles aus Starter",
      "Google Bewertungen",
      "NFC Unterstützung",
      "Erweiterte Funktionen",
    ],
    featured: true,
  },
  {
    name: "Business",
    price: "39",
    description: "Für professionelle Restaurantbetriebe.",
    features: [
      "Alles aus Pro",
      "Mehrere Standorte",
      "Erweiterte Verwaltung",
      "Priorisierter Support",
    ],
    featured: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#17251c]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f8f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173c2b] text-lg font-bold text-white">
              Q
            </div>
            <span className="text-xl font-bold tracking-tight">qartivo</span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#funktionen" className="transition hover:text-[#26734d]">
              Funktionen
            </a>
            <a href="#so-funktionierts" className="transition hover:text-[#26734d]">
              So funktioniert&apos;s
            </a>
            <a href="#preise" className="transition hover:text-[#26734d]">
              Preise
            </a>
            <a href="#demo" className="transition hover:text-[#26734d]">
              Demo
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-black/5 sm:block"
            >
              Login
            </a>
            <a
              href="#preise"
              className="rounded-full bg-[#173c2b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#23573e] hover:shadow-md"
            >
              Kostenlos starten
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#cfe8d5] opacity-50 blur-3xl" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-[#dcebd8] opacity-60 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:pb-32 lg:pt-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#bad4c1] bg-white/70 px-4 py-2 text-sm font-medium text-[#28563c]">
              <span className="h-2 w-2 rounded-full bg-[#4c9a68]" />
              Die digitale Lösung für moderne Restaurants
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Ihr Restaurant.
              <br />
              <span className="text-[#2f7d51]">Digitaler.</span>
              <br />
              Einfacher.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#59665d]">
              Mit Qartivo verwandeln Sie Ihr Restaurant in ein modernes
              digitales Erlebnis – mit QR-Menü, Google Bewertungen, NFC und
              zentraler Verwaltung.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#preise"
                className="rounded-full bg-[#173c2b] px-7 py-4 text-center font-semibold text-white shadow-lg shadow-[#173c2b]/15 transition hover:-translate-y-0.5 hover:bg-[#23573e]"
              >
                Jetzt kostenlos starten →
              </a>

              <a
                href="#demo"
                className="rounded-full border border-black/10 bg-white px-7 py-4 text-center font-semibold transition hover:border-black/20 hover:bg-white/80"
              >
                Demo ansehen
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#68736c]">
              <span>✓ Keine Kreditkarte</span>
              <span>✓ Schnell eingerichtet</span>
              <span>✓ Mobil optimiert</span>
            </div>
          </div>

          {/* HERO MOCKUP */}
          <div id="demo" className="relative">
            <div className="absolute -inset-5 rounded-[40px] bg-[#dcebdc]/70 blur-2xl" />

            <div className="relative mx-auto max-w-md rotate-[1deg] rounded-[30px] border border-black/10 bg-white p-3 shadow-2xl shadow-black/10">
              <div className="overflow-hidden rounded-[23px] bg-[#f5f7f3]">
                <div className="bg-[#173c2b] px-6 pb-8 pt-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                        Restaurant
                      </p>
                      <h3 className="mt-1 text-2xl font-bold">La Tavola</h3>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg text-[#173c2b]">
                      LT
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-white/70">
                    Italienische Küche · Basel
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex gap-2 overflow-hidden">
                    {["Antipasti", "Pizza", "Pasta", "Dessert"].map(
                      (category, index) => (
                        <span
                          key={category}
                          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${
                            index === 0
                              ? "bg-[#173c2b] text-white"
                              : "bg-white text-[#5e685f]"
                          }`}
                        >
                          {category}
                        </span>
                      ),
                    )}
                  </div>

                  {[
                    ["Burrata", "Tomate · Basilikum · Olivenöl", "14.50 €"],
                    ["Bruschetta", "Tomate · Knoblauch · Basilikum", "9.50 €"],
                    ["Vitello Tonnato", "Kalb · Thunfisch · Kapern", "16.90 €"],
                  ].map(([name, description, price]) => (
                    <div
                      key={name}
                      className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold">{name}</h4>
                          <p className="mt-1 text-xs leading-5 text-[#7a837d]">
                            {description}
                          </p>
                        </div>
                        <span className="whitespace-nowrap text-sm font-bold text-[#2f7d51]">
                          {price}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-2xl bg-[#e7f1e8] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173c2b] text-white">
                        ★
                      </div>
                      <div>
                        <p className="text-sm font-bold">Gefällt Ihnen unser Essen?</p>
                        <p className="text-xs text-[#667269]">
                          Bewerten Sie uns auf Google
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f1e7] text-[#2f7d51]">
                  ★
                </div>
                <div>
                  <p className="text-sm font-bold">Google Bewertungen</p>
                  <p className="text-xs text-[#7b847d]">Mehr Sichtbarkeit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-7 text-center sm:flex-row sm:text-left lg:px-8">
          <p className="text-sm font-medium text-[#707a73]">
            Entwickelt für die digitale Gastronomie
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-[#8a938c] sm:gap-10">
            <span>RESTAURANTS</span>
            <span>CAFÉS</span>
            <span>BARS</span>
            <span>HOTELS</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funktionen" className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2f7d51]">
            Alles in einer Plattform
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Alles, was Ihr Restaurant digital braucht.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#68736c]">
            Qartivo verbindet die wichtigsten digitalen Werkzeuge für
            Restaurants in einer einfachen Plattform.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-3xl border border-black/5 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f0e6] text-xl font-bold text-[#2f7d51] transition group-hover:bg-[#173c2b] group-hover:text-white">
                {feature.icon}
              </div>

              <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>

              <p className="mt-3 text-sm leading-6 text-[#707a73]">
                {feature.description}
              </p>

              <a
                href="#"
                className="mt-6 inline-flex text-sm font-semibold text-[#2f7d51]"
              >
                Mehr erfahren →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="so-funktionierts"
        className="bg-[#173c2b] text-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9ed0aa]">
              Einfacher Start
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              In wenigen Minuten digital.
            </h2>

            <p className="mt-5 text-lg leading-8 text-white/65">
              Kein kompliziertes System. Kein langes Setup. Qartivo ist so
              aufgebaut, dass Sie schnell loslegen können.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-3xl border border-white/10 bg-white/5 p-8"
              >
                <span className="text-sm font-bold text-[#9ed0aa]">
                  {step.number}
                </span>

                <h3 className="mt-8 text-2xl font-bold">{step.title}</h3>

                <p className="mt-3 leading-7 text-white/60">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="preise" className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2f7d51]">
            Transparente Preise
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Wählen Sie den passenden Plan.
          </h2>

          <p className="mt-5 text-lg leading-8 text-[#68736c]">
            Starten Sie kostenlos und erweitern Sie Qartivo, wenn Ihr
            Restaurant wächst.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 ${
                plan.featured
                  ? "border-[#2f7d51] bg-[#173c2b] text-white shadow-2xl shadow-[#173c2b]/20"
                  : "border-black/5 bg-white"
              }`}
            >
              {plan.featured && (
                <div className="absolute right-6 top-6 rounded-full bg-[#9ed0aa] px-3 py-1 text-xs font-bold text-[#173c2b]">
                  Beliebt
                </div>
              )}

              <h3 className="text-xl font-bold">{plan.name}</h3>

              <p
                className={`mt-3 min-h-12 text-sm leading-6 ${
                  plan.featured ? "text-white/60" : "text-[#707a73]"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-bold">{plan.price}€</span>
                <span
                  className={`mb-2 text-sm ${
                    plan.featured ? "text-white/50" : "text-[#7c857e]"
                  }`}
                >
                  / Monat
                </span>
              </div>

              <a
                href="#"
                className={`mt-8 block rounded-full px-5 py-3.5 text-center text-sm font-bold transition ${
                  plan.featured
                    ? "bg-white text-[#173c2b] hover:bg-[#edf5ee]"
                    : "bg-[#173c2b] text-white hover:bg-[#23573e]"
                }`}
              >
                Kostenlos starten
              </a>

              <div
                className={`my-8 h-px ${
                  plan.featured ? "bg-white/10" : "bg-black/5"
                }`}
              />

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm">
                    <span className="font-bold text-[#65a878]">✓</span>
                    <span
                      className={
                        plan.featured ? "text-white/75" : "text-[#59645d]"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="login" className="px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#dcebdc] px-8 py-16 text-center sm:px-12 lg:px-20 lg:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2f7d51]">
            Qartivo
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Bereit für das digitale Restaurant?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#637066]">
            Erstellen Sie Ihr digitales Restaurantprofil und entdecken Sie,
            wie einfach Gastronomie digital sein kann.
          </p>

          <a
            href="#preise"
            className="mt-8 inline-flex rounded-full bg-[#173c2b] px-7 py-4 font-semibold text-white shadow-lg transition hover:bg-[#23573e]"
          >
            Jetzt kostenlos starten →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#173c2b] text-sm font-bold text-white">
                  Q
                </div>
                <span className="text-lg font-bold">qartivo</span>
              </div>

              <p className="mt-3 max-w-xs text-sm leading-6 text-[#7a837d]">
                Die digitale Plattform für moderne Restaurants.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#68736c]">
              <a href="#" className="hover:text-[#2f7d51]">
                Impressum
              </a>
              <a href="#" className="hover:text-[#2f7d51]">
                Datenschutz
              </a>
              <a href="#" className="hover:text-[#2f7d51]">
                Kontakt
              </a>
            </div>
          </div>

          <div className="border-t border-black/5 pt-6 text-sm text-[#929992]">
            © 2026 qartivo. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </main>
  );
}
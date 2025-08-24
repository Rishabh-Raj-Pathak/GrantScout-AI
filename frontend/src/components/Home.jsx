import { Button } from "./ui/button";

function Navbar({ onGetStarted }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs tracking-tight">
                  SG
                </span>
              </div>
              <span className="text-white font-semibold text-sm tracking-tight">
                Startup Grant Finder Agent
              </span>

            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className="text-slate-300 hover:text-white transition-all duration-200 relative group text-sm font-medium"
              >
                <span>Home</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#features"
                className="text-slate-300 hover:text-white transition-all duration-200 relative group text-sm font-medium"
              >
                <span>Features</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#how-it-works"
                className="text-slate-300 hover:text-white transition-all duration-200 relative group text-sm font-medium"
              >
                <span>How It Works</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#contact"
                className="text-slate-300 hover:text-white transition-all duration-200 relative group text-sm font-medium"
              >
                <span>Contact</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>
          <Button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 px-6 py-2 text-sm font-semibold tracking-tight rounded-xl backdrop-blur-sm"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ onGetStarted }) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 w-full"
    >
      {/* Animated gradient background - full bleed */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-r from-cyan-600/15 to-blue-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight max-w-5xl mx-auto">
             Find Grants That{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Fuel Your Startup's Journey
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Funding shouldn't be harder than building. Our AI-powered Grant
            Finder Agent helps founders, students, and solo entrepreneurs cut
            through the noise and discover relevant, non-dilutive grants in
            minutes — not weeks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 px-10 py-4 text-lg font-semibold tracking-tight rounded-2xl backdrop-blur-sm"
            >
              Start Finding Grants
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600/50 bg-slate-800/30 backdrop-blur-sm text-white hover:bg-slate-700/50 hover:border-slate-500/70 transition-all duration-300 px-10 py-4 text-lg font-medium tracking-tight rounded-2xl transform hover:-translate-y-0.5"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              How It Works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    "Funding opportunities are scattered across dozens of portals",
    "Filled with complex jargon, PDFs, and legal filters",
    "Search takes hours every week, only to find irrelevant results",
    "Many founders give up and miss out on free money",
  ];

  return (
    <section className="py-24 bg-slate-900 w-full">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
            Why Finding Grants <span className="text-red-400">Sucks Today</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-8 hover:border-red-400/40 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-500 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-6">
                <div className="w-10 h-10 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-red-500/30 transition-colors duration-300">
                  <span className="text-red-400 text-xl">×</span>
                </div>
                <p className="text-slate-200 text-lg font-medium leading-relaxed">
                  {problem}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const features = [
    "Asks the right questions in a conversational flow",
    "Searches multiple public funding portals in real-time",
    "Summarizes results into clear, human-friendly insights (amount, eligibility, deadline)",
    "Works without heavy logins, databases, or clutter — just fast answers",
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-800 w-full">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
            Meet Your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Startup Grant Finder Agent
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 font-medium">
            A lightweight web-based AI that:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-500 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg group-hover:shadow-indigo-500/30 transition-shadow duration-300">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <p className="text-slate-200 text-lg font-medium leading-relaxed">
                  {feature}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-indigo-900/30 to-cyan-900/30 backdrop-blur-sm border border-indigo-400/20 rounded-2xl p-12 text-center hover:border-indigo-400/40 transition-all duration-500 max-w-5xl mx-auto">
          <p className="text-xl text-slate-200 leading-relaxed font-medium">
            Backed by the{" "}
            <span className="font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Portia AI SDK
            </span>
            , the agent organizes your intent, filters out irrelevant grants,
            and delivers only the opportunities that matter.
          </p>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "🎯",
      title: "Smart Search",
      description: "Country-specific, eligibility-aware results",
    },
    {
      icon: "⚡",
      title: "Fast Summaries",
      description: "Grant criteria, funding amount, deadlines at a glance",
    },
    {
      icon: "🔒",
      title: "Lightweight & Private",
      description: "No accounts or databases, everything runs locally",
    },
    {
      icon: "📩",
      title: "Weekly Digest",
      description: "Fresh opportunities delivered straight to your inbox",
    },
  ];

  return (
    <section id="features" className="py-24 bg-slate-900 w-full">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
            What You'll{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Love
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-8 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-slate-300 font-medium leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Tell us about your startup.",
      description:
        'Example: "I\'m a student founder in India working on an AI tool."',
    },
    {
      number: "2",
      title: "The agent clarifies and searches.",
      description: "Powered by Portia, it scours funding portals for you.",
    },
    {
      number: "3",
      title: "Get only relevant grants.",
      description:
        "With key details in plain English: how much, who qualifies, and when to apply.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 w-full"
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
            How It Works
          </h2>
        </div>

        {/* PROJECT WALKTHROUGH VIDEO */}
        {/* video section placeholder */}

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-10 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-500 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mb-8 shadow-xl group-hover:shadow-indigo-500/40 transition-shadow duration-300 transform group-hover:scale-110">
                  <span className="text-white font-bold text-xl tracking-tight">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-6 leading-tight tracking-tight">
                  {step.title}
                </h3>
                <p className="text-slate-300 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-60"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortiaHighlightSection() {
  return (
    <section className="py-24 bg-slate-800 w-full">
      <div className="w-full px-4 md:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 backdrop-blur-sm border border-indigo-400/20 rounded-2xl p-16 hover:border-indigo-400/40 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
            Powered by{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Portia AI SDK
            </span>{" "}
            ⚡
          </h2>
          <p className="text-xl text-slate-200 leading-relaxed font-medium max-w-3xl mx-auto">
            We built this agent on top of Portia's orchestration framework,
            which coordinates intent clarification, search, and reasoning. This
            makes the experience faster, smarter, and explainable — without
            bloating our stack.
          </p>
        </div>
      </div>
    </section>
  );
}

function CTASection({ onGetStarted }) {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 w-full">
      <div className="w-full px-4 md:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
            Stop wasting hours hunting grants.
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 font-medium leading-relaxed">
            Let your Grant Finder Agent do the work, so you can focus on
            building.
          </p>
          <p className="text-lg text-slate-400 mb-12 font-medium">
            👉 Ready to discover your next funding opportunity?
          </p>
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 px-12 py-4 text-lg font-semibold tracking-tight rounded-2xl backdrop-blur-sm"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const tips = [
    "Non-dilutive capital = equity stays yours.",
    "Most founders spend 6–12 hours/week hunting grants. Save that time for building.",
    "Eligibility is 80% of success. Let the agent filter ruthlessly.",
  ];

  return (
    <footer
      id="contact"
      className="bg-slate-950 border-t border-slate-800/50 w-full"
    >
      <div className="w-full px-4 md:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 mb-12 max-w-6xl mx-auto">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm tracking-tight">
                  SG
                </span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                Startup Grant Finder Agent
              </span>
            </div>
            <p className="text-slate-400 mb-8 text-lg font-medium leading-relaxed">
              AI-powered grant discovery for founders, students, and solo
              entrepreneurs.
            </p>
            <div className="flex space-x-8">
              <a
                href="#about"
                className="text-slate-400 hover:text-white transition-colors duration-200 font-medium"
              >
                About
              </a>
              <a
                href="#features"
                className="text-slate-400 hover:text-white transition-colors duration-200 font-medium"
              >
                Features
              </a>
              <a
                href="#docs"
                className="text-slate-400 hover:text-white transition-colors duration-200 font-medium"
              >
                Docs
              </a>
              <a
                href="#contact"
                className="text-slate-400 hover:text-white transition-colors duration-200 font-medium"
              >
                Contact
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg tracking-tight">
              💡 Pro Tips
            </h4>
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <p
                  key={index}
                  className="text-slate-400 font-medium leading-relaxed italic"
                >
                  "{tip}"
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-500 font-medium">
            Built during Hackathon 2025 • Powered by Portia AI
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white w-full font-sans">
      <style jsx>{`
        .font-sans {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <Navbar onGetStarted={onGetStarted} />
      <HeroSection onGetStarted={onGetStarted} />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PortiaHighlightSection />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}

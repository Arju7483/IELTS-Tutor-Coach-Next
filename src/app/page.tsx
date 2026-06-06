import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Animated Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-glow blur-[120px] pointer-events-none animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-glow blur-[120px] pointer-events-none animate-float" style={{ animationDelay: '1.5s' }}></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet flex items-center justify-center font-display font-extrabold text-dark text-xl shadow-glow-primary">
            I
          </div>
          <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-foreground to-zinc-400 bg-clip-text text-transparent">
            IELTS<span className="text-primary">Coach</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="px-5 py-2.5 rounded-full bg-primary text-dark font-semibold text-sm hover:scale-105 transition-all shadow-glow-primary">
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center z-10">
        <div className="max-w-4xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-primary/20 text-xs font-semibold tracking-wider uppercase text-primary mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Powered by Gemini 2.5 Flash
          </div>

          {/* Heading */}
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Master the IELTS Exam <br />
            With <span className="bg-gradient-to-r from-primary via-sky to-violet bg-clip-text text-transparent">AI-Powered Coaching</span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl leading-relaxed">
            Get instant Band 7/8/9 grading, criteria breakdowns, vocabulary upgrades, and personalized speaking critiques. Zero cost, native performance.
          </p>

          {/* CTAs */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-dark font-bold text-lg hover:scale-105 transition-all shadow-glow-primary">
              Start Free Training
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card text-white font-semibold text-lg hover:border-zinc-700 transition-all">
              Sign In to Account
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-8 rounded-3xl text-left group">
            <div className="w-12 h-12 rounded-2xl bg-primary-subtle border border-primary/30 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Writing Evaluation</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Submit Task 2 essays and receive granular scores on task achievement, coherence, vocabulary, and grammar with clear steps for band elevation.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 rounded-3xl text-left group">
            <div className="w-12 h-12 rounded-2xl bg-violet-subtle border border-violet/30 flex items-center justify-center text-violet mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Speaking Critiques</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Record short tasks or full 3-4 minute speaking cards. Our AI analyzes pitch, vocabulary, grammar, and fluency to deliver structured correction.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 rounded-3xl text-left group">
            <div className="w-12 h-12 rounded-2xl bg-accent-subtle border border-accent/30 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Smart Flashcards</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Generate advanced Band 7/8/9 vocabulary matching any topic. Practice with animated flipping flashcards containing phonetics and IELTS examples.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-dark-border text-center text-zinc-500 text-xs z-10">
        &copy; {new Date().getFullYear()} IELTS Coach. Free and Unlimited AI Exam Prep.
      </footer>
    </div>
  );
}

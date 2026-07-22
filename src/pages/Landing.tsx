import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  Dna,
  HeartPulse,
  LockKeyhole,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import healthcareLogo from "@/assets/healthcare.png";

const pathways = [
  {
    icon: Dna,
    title: "Your genome, translated",
    text: "Bring your raw DNA file into a private, guided workspace. Your data is never requested in a public chat.",
  },
  {
    icon: BrainCircuit,
    title: "Evidence before answers",
    text: "Ask ordinary questions and receive careful explanations with source context, confidence, and clear limits.",
  },
  {
    icon: HeartPulse,
    title: "Care stays human",
    text: "Cyber-Medi helps you prepare better questions and makes it clear when a licensed clinician belongs in the room.",
  },
];

const Landing = () => (
  <div className="cm-site min-h-screen overflow-hidden bg-background text-foreground">
    <header className="cm-nav">
      <Link to="/" className="cm-brand" aria-label="Cyber-Medi home">
        <img src={healthcareLogo} alt="Cyber-Medi healthcare emblem" />
        <span><strong>CYBER-MEDI</strong><small>Private genomic guidance</small></span>
      </Link>
      <nav className="cm-nav-links" aria-label="Primary navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#privacy">Privacy</a>
        <a href="#care">Care model</a>
      </nav>
      <div className="cm-nav-actions">
        <Link to="/auth" className="cm-text-link">Sign in</Link>
        <Link to="/auth?mode=register" className="cm-button cm-button-small">Create account</Link>
      </div>
    </header>

    <main>
      <section className="cm-hero">
        <video className="cm-hero-video" autoPlay loop muted playsInline aria-hidden="true">
          <source src="/videos/dna-blue.mp4" type="video/mp4" />
        </video>
        <div className="cm-hero-shade" />
        <div className="cm-orb cm-orb-one" />
        <div className="cm-orb cm-orb-two" />
        <div className="cm-hero-content">
          <div className="cm-eyebrow"><Sparkles size={15} /> PRIVATE, EVIDENCE-AWARE GENOMIC CARE</div>
          <h1>Your DNA,<br /><span>explained with care.</span></h1>
          <p>
            A calm, private way to understand what your DNA file may be saying—
            in language you can use, with clinical boundaries you can trust.
          </p>
          <div className="cm-hero-actions">
            <Link to="/auth?mode=register" className="cm-button">Create my account <ArrowRight size={18} /></Link>
            <Link to="/auth" className="cm-button cm-button-ghost">Sign in</Link>
          </div>
          <div className="cm-trust-row">
            <span><ShieldCheck /> Governed access</span>
            <span><LockKeyhole /> Private by design</span>
            <span><MessageCircleHeart /> Human language</span>
          </div>
        </div>
        <a className="cm-scroll" href="#how-it-works" aria-label="Explore how it works"><ChevronDown /></a>
      </section>

      <section id="how-it-works" className="cm-section cm-pathways">
        <div className="cm-section-heading">
          <span>HOW CYBER-MEDI WORKS</span>
          <h2>Clarity without the clinical noise.</h2>
          <p>Three deliberate steps. No pasted genomes. No exaggerated certainty.</p>
        </div>
        <div className="cm-card-grid">
          {pathways.map(({ icon: Icon, title, text }, index) => (
            <article className="cm-depth-card" key={title}>
              <div className="cm-card-number">0{index + 1}</div>
              <div className="cm-icon"><Icon /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="privacy" className="cm-section cm-privacy">
        <div className="cm-privacy-visual">
          <div className="cm-seal-rings" />
          <img src={healthcareLogo} alt="Cyber-Medi protected healthcare workspace" />
        </div>
        <div className="cm-privacy-copy">
          <span className="cm-kicker">PRIVATE BY DEFAULT</span>
          <h2>Your genome is not a prompt.</h2>
          <p>
            Raw genomic data belongs inside a controlled health workspace—not a public form,
            not a generic chatbot, and not an advertising profile.
          </p>
          <ul>
            <li><Check /> Guided upload only after authentication</li>
            <li><Check /> Tenant-isolated access and multi-factor verification</li>
            <li><Check /> Evidence and uncertainty shown alongside explanations</li>
            <li><Check /> Clear escalation to licensed clinical care</li>
          </ul>
          <Link to="/security" className="cm-inline-link">Explore our security model <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section id="care" className="cm-section cm-care">
        <div className="cm-care-glow" />
        <div className="cm-care-inner">
          <div className="cm-eyebrow"><HeartPulse size={15} /> BUILT FOR REAL-LIFE QUESTIONS</div>
          <h2>Better questions. Calmer conversations.</h2>
          <p>
            Cyber-Medi does not diagnose. It helps you understand your information,
            prepare for a professional conversation, and recognize when the next step should be a doctor.
          </p>
          <Link to="/auth?mode=register" className="cm-button">Begin privately <ArrowRight size={18} /></Link>
        </div>
      </section>
    </main>

    <footer className="cm-footer">
      <div className="cm-brand">
        <img src={healthcareLogo} alt="Cyber-Medi" />
        <span><strong>CYBER-MEDI</strong><small>Powered by Cyberellum Technologies & Laboratory</small></span>
      </div>
      <div className="cm-footer-links">
        <Link to="/about">About</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/security">Security</Link>
      </div>
      <small>© {new Date().getFullYear()} Cyberellum Technologies & Laboratory</small>
    </footer>
  </div>
);

export default Landing;

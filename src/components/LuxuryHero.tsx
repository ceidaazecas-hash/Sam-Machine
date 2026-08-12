import React from 'react';
import { useLab } from '../context/LabContext';
import { 
  Scissors, 
  ArrowRight, 
  ShieldCheck, 
  Compass, 
  Sliders, 
  Check 
} from 'lucide-react';

export const LuxuryHero: React.FC = () => {
  const { setActiveTab } = useLab();

  return (
    <div className="luxury-hero-wrapper">
      {/* PURE BLACK HERO SECTION */}
      <section className="luxury-hero-black">
        {/* Subtle Luxury Pattern */}
        <div className="luxury-hero-backdrop" />

        <div className="luxury-hero-content">
          <div className="luxury-pill-tag">
            <span className="pill-dot" />
            <span>ACADEMIC YEAR 2026 / 2027 • ATELIER LABS</span>
          </div>

          <h1 className="luxury-hero-title">
            RESERVATION OF INDUSTRIAL WORKSTATIONS FOR YOUR BESPOKE CREATIONS
          </h1>

          <p className="luxury-hero-subtitle">
            Experience unparalleled precision with calibrated Juki lockstitch machines and high-speed overlockers across Studios 719, 721, and 724.
          </p>

          <div className="luxury-hero-actions">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('studio-booking-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setActiveTab('REQUEST');
              }}
              className="btn-luxury-pill-white"
            >
              <span>RESERVE STATION</span>
              <div className="btn-arrow-circle">
                <ArrowRight size={14} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('RETURN')}
              className="btn-luxury-pill-outline"
            >
              <span>RETURN & AUDIT WORKFLOW</span>
            </button>
          </div>
        </div>

        {/* ELEGANT ORGANIC WAVE DIVIDER */}
        <div className="luxury-wave-divider">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,58.7C840,43,960,21,1080,21.3C1200,21,1320,43,1380,53.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
              fill="var(--luxury-white-bg)"
            />
          </svg>
        </div>
      </section>

      {/* CRISP WHITE SHOWCASE SECTION */}
      <section className="luxury-white-showcase">
        <div className="luxury-showcase-grid">
          {/* Left Column: Overlapping Luxury Images with Floating Stat Badges */}
          <div className="showcase-images-cluster">
            {/* Main Tall Image */}
            <div className="image-card tall-card">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=700"
                alt="Haute Couture Atelier Tailoring"
                className="showcase-img"
              />
              {/* Floating Top Stat Badge */}
              <div className="floating-stat-badge top-badge">
                <span className="badge-stat-num">16+</span>
                <span className="badge-stat-sub">LOCKSTITCH PODS</span>
              </div>
            </div>

            {/* Right Stacked Column */}
            <div className="image-stacked-col">
              <div className="image-card sub-card">
                <img
                  src="https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&q=80&w=500"
                  alt="Industrial Sewing Machine Precision"
                  className="showcase-img"
                />
              </div>

              <div className="image-card sub-card relative-stat">
                <img
                  src="https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&q=80&w=500"
                  alt="Fine Fabric Draping"
                  className="showcase-img"
                />
                {/* Floating Bottom Stat Badge */}
                <div className="floating-stat-badge bottom-badge">
                  <span className="badge-stat-num">300+</span>
                  <span className="badge-stat-sub">HOURS LOGGED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text & Checklist */}
          <div className="showcase-text-block">
            <div className="editorial-pill">
              <span>ABOUT THE STUDIOS</span>
            </div>

            <h2 className="showcase-editorial-title">
              WE PREPARE & CALIBRATE THE EQUIPMENT FOR YOUR DREAMS
            </h2>

            <p className="showcase-editorial-desc">
              We provide seamless requisition of industrial sewing machines, heavy-duty walking foot workstations, and high-speed multi-thread sergers, ensuring uninterrupted studio time and highest safety standards.
            </p>

            <div className="showcase-checklist">
              <div className="checklist-row">
                <div className="check-icon-circle">
                  <Check size={14} />
                </div>
                <span>Direct-drive servo motors with speed regulation & auto-trimming</span>
              </div>

              <div className="checklist-row">
                <div className="check-icon-circle">
                  <Check size={14} />
                </div>
                <span>Industrial 4-thread & 5-thread safety stitch overlockers (Rooms 719 & 721)</span>
              </div>

              <div className="checklist-row">
                <div className="check-icon-circle">
                  <Check size={14} />
                </div>
                <span>Verified 5-point return inspection & lecturer audit trail</span>
              </div>
            </div>

            <div className="showcase-btn-row">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('studio-booking-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-luxury-black-pill"
              >
                <span>EXPLORE WORKSPACES</span>
                <div className="btn-arrow-circle dark">
                  <ArrowRight size={14} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PURE DEEP BLACK FEATURE GRID */}
      <section className="luxury-black-features">
        <div className="features-inner">
          <div className="feature-wireframe-card">
            <div className="feature-icon-box">
              <Scissors size={26} />
            </div>
            <h3 className="feature-card-title">Industrial Lockstitch</h3>
            <p className="feature-card-desc">
              Stations 2401–2416 equipped with Teflon feet, edge guides, and silent servo motors for high-speed apparel construction.
            </p>
          </div>

          <div className="feature-wireframe-card">
            <div className="feature-icon-box">
              <Sliders size={26} />
            </div>
            <h3 className="feature-card-title">Edge Serging Fleet</h3>
            <p className="feature-card-desc">
              Pegasus & Yamato overlockers (2101–2102) calibrated for delicate jersey stretch fabrics and structured heavy twill.
            </p>
          </div>

          <div className="feature-wireframe-card">
            <div className="feature-icon-box">
              <ShieldCheck size={26} />
            </div>
            <h3 className="feature-card-title">5-Point Safety Audit</h3>
            <p className="feature-card-desc">
              Mandatory physical inspection upon return ensuring needle integrity, clean bobbin cases, and safe workspaces.
            </p>
          </div>

          <div className="feature-wireframe-card">
            <div className="feature-icon-box">
              <Compass size={26} />
            </div>
            <h3 className="feature-card-title">Faculty Sign-Off</h3>
            <p className="feature-card-desc">
              Real-time review queue, student compliance tracking, and instantaneous digital QR equipment boarding passes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

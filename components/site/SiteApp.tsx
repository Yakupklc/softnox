"use client";
import { useState, useEffect, useMemo, useRef } from "react";

/* ===== Icon components ===== */
const Icon = ({ d, size = 20, stroke = 1.5 }: { d: React.ReactNode; size?: number; stroke?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={stroke}
       strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const ArrowRight = (p: any) => <Icon {...p} d={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>} />;
const ArrowUpRight = (p: any) => <Icon {...p} d={<><path d="M7 17 17 7"/><path d="M7 7h10v10"/></>} />;
const Check = (p: any) => <Icon {...p} d={<path d="M20 6 9 17l-5-5"/>} />;
const Menu = (p: any) => <Icon {...p} d={<><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>} />;
const Close = (p: any) => <Icon {...p} d={<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>} />;
const Mail = (p: any) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>} />;
const Phone = (p: any) => <Icon {...p} d={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>} />;
const MapPin = (p: any) => <Icon {...p} d={<><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>} />;
const Globe = (p: any) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></>} />;

const CrmIcon = (p: any) => <Icon {...p} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />;
const StockIcon = (p: any) => <Icon {...p} d={<><path d="M21 8V21H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></>} />;
const CalendarIcon = (p: any) => <Icon {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></>} />;
const CartIcon = (p: any) => <Icon {...p} d={<><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></>} />;
const DashIcon = (p: any) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>} />;
const CodeIcon = (p: any) => <Icon {...p} d={<><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></>} />;
const WebIcon = (p: any) => <Icon {...p} d={<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></>} />;
const AppIcon = (p: any) => <Icon {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><circle cx="7" cy="6" r=".5" fill="currentColor"/></>} />;
const MobileIcon = (p: any) => <Icon {...p} d={<><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M12 18h.01"/></>} />;
const SettingsIcon = (p: any) => <Icon {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} />;
const PaletteIcon = (p: any) => <Icon {...p} d={<><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 10 10c0 2.76-2.24 5-5 5h-1.5a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 1-1.5 2z"/></>} />;
const ShieldIcon = (p: any) => <Icon {...p} d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>} />;

/* ===== Logo ===== */
const Logo = ({ size = 28 }: { size?: number }) => (
  <div className="logo">
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="#22d3ee"/>
          <stop offset="1" stopColor="#3b82f6"/>
        </linearGradient>
      </defs>
      <path d="M16 2 L29 9 L29 23 L16 30 L3 23 L3 9 Z" stroke="url(#lg1)" strokeWidth="1.5" fill="none"/>
      <path d="M11 12 Q11 10 13 10 L19 10 Q21 10 21 12 Q21 14 19 14 L13 14 Q11 14 11 16 Q11 18 13 18 L19 18 Q21 18 21 20 Q21 22 19 22 L13 22 Q11 22 11 20" stroke="url(#lg1)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span className="logo-text">softnox</span>
  </div>
);

/* ===== Nav ===== */
const NAV_ITEMS = [
  { id: "anasayfa", label: "Ana Sayfa" },
  { id: "hakkimizda", label: "Hakkımızda" },
  { id: "urunler", label: "Ürünler" },
  { id: "hizmetler", label: "Hizmetler" },
  { id: "projeler", label: "Projeler" },
  { id: "referanslar", label: "Referanslar" },
  { id: "iletisim", label: "İletişim" },
];

function SitePhoneContact() {
  const [open, setOpen] = useState(false);
  const phone = "+905511621359";
  const display = "+90 (551) 162 15 59";
  return (
    <li style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "contents", background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%", color: "inherit", font: "inherit" }}>
        <span className="contact__ic"><Phone size={16} /></span>
        <div><span className="ci__lbl">Telefon</span><span className="ci__val">{display}</span></div>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 98 }} />
          <div style={{ position: "absolute", left: 0, top: "calc(100% + 8px)", zIndex: 99, background: "rgba(10,14,28,0.98)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "6px 4px", display: "flex", flexDirection: "column", gap: 4, minWidth: 160, boxShadow: "0 12px 32px #000a" }}>
            <a href={`tel:${phone}`} onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 7, color: "#fbbf24", fontSize: 13, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <Phone size={14} /> Telefon Et
            </a>
            <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 7, color: "#4ade80", fontSize: 13, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </>
      )}
    </li>
  );
}

const Nav = ({ active, onJump }: { active: string; onJump: (id: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const handler = (e: MouseEvent | TouchEvent) => {
        if (navRef.current && !navRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("click", handler);
      document.addEventListener("touchstart", handler as EventListener);
      return () => {
        document.removeEventListener("click", handler);
        document.removeEventListener("touchstart", handler as EventListener);
      };
    }, 100);
    return () => clearTimeout(timer);
  }, [open]);

  const jump = (id: string) => { setOpen(false); onJump(id); };
  return (
    <header ref={navRef} className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="nav__inner">
        <a href="#anasayfa" onClick={(e) => { e.preventDefault(); jump("anasayfa"); }}><Logo /></a>
        <nav className="nav__links">
          {NAV_ITEMS.map(it => (
            <a key={it.id} href={`#${it.id}`}
               onClick={(e) => { e.preventDefault(); jump(it.id); }}
               className={active === it.id ? "is-active" : ""}>{it.label}</a>
          ))}
        </nav>
        <div className="nav__cta">
          <button className="btn btn--primary btn--sm" onClick={() => jump("iletisim")}>
            Teklif Al <ArrowRight size={14} />
          </button>
          <button className="nav__burger" onClick={() => setOpen(o => !o)} aria-label="Menü">
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="nav__mobile">
          {NAV_ITEMS.map(it => (
            <a key={it.id} href={`#${it.id}`} onClick={(e) => { e.preventDefault(); jump(it.id); }}>
              <span>{it.label}</span><ArrowRight size={16} />
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

/* ===== Hero Visual ===== */
const HeroVisual = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1400);
    return () => clearInterval(id);
  }, []);
  const bars = [62, 78, 45, 88, 70, 54, 92, 66];
  return (
    <div className="hv">
      <div className="hv__card hv__card--main">
        <div className="hv__chrome">
          <div className="hv__dots"><i /><i /><i /></div>
          <div className="hv__path">softnox / dashboard</div>
          <div className="hv__live"><span className="live-dot" />live</div>
        </div>
        <div className="hv__body">
          <div className="hv__row">
            {[
              { l: "Aktif Projeler", n: "24", d: "▲ 12%", up: true },
              { l: "API Çağrısı", n: "1.4M", d: "▲ 8%", up: true },
              { l: "Uptime", n: "99.98%", d: "— stable", up: false },
            ].map(s => (
              <div key={s.l} className="hv__stat">
                <span className="hv__lbl">{s.l}</span>
                <span className="hv__num">{s.n}</span>
                <span className={`hv__delta ${s.up ? "delta--up" : ""}`}>{s.d}</span>
              </div>
            ))}
          </div>
          <div className="hv__chart">
            {bars.map((h, i) => (
              <div key={i} className="hv__bar" style={{
                height: `${Math.max(10, (h + Math.sin((tick + i) / 2) * 10))}%`,
                animationDelay: `${i * 0.06}s`
              }} />
            ))}
          </div>
          <div className="hv__rows">
            {[
              { name: "CRM Modülü v2.3", st: "deploy", pct: 92 },
              { name: "E-Ticaret Checkout", st: "build", pct: 64 },
              { name: "Mobil Auth Servisi", st: "qa", pct: 38 },
            ].map(r => (
              <div key={r.name} className="hv__line">
                <span className="hv__lname">{r.name}</span>
                <span className={`hv__chip chip--${r.st}`}>{r.st}</span>
                <div className="hv__pbar"><div style={{ width: `${r.pct}%` }} /></div>
                <span className="hv__pct">{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hv__card hv__card--code">
        <div className="hv__chrome">
          <div className="hv__dots"><i /><i /><i /></div>
          <div className="hv__path">api.ts</div>
        </div>
        <pre className="hv__code">
<span className="c-com">{"// softnox / api"}</span>{"\n"}
<span className="c-key">{"export async function"}</span> <span className="c-fn">getOrders</span>{"() {"}{"\n"}
{"  "}<span className="c-key">const</span> res = <span className="c-key">await</span> fetch(<span className="c-str">{`'/api/v2/orders'`}</span>);{"\n"}
{"  "}<span className="c-key">return</span> res.<span className="c-fn">json</span>();{"\n"}
{"}"}
        </pre>
      </div>
      <div className="hv__card hv__card--mini">
        <div className="hv__mini-row">
          <span className="hv__mini-dot" />
          <span>Sprint #18</span>
        </div>
        <div className="hv__mini-num">87<span>%</span></div>
        <div className="hv__mini-lbl">tamamlandı</div>
      </div>
    </div>
  );
};

/* ===== Hero ===== */
const Hero = ({ onJump }: { onJump: (id: string) => void }) => (
  <section id="anasayfa" className="hero">
    <div className="hero__grid-bg" />
    <div className="hero__glow hero__glow--1" />
    <div className="hero__glow hero__glow--2" />
    <div className="container hero__inner">
      <div className="hero__left">
        <div className="eyebrow">
          <span className="eyebrow__dot" />
          <span>Yazılım · Dijital Dönüşüm · Otomasyon</span>
        </div>
        <h1 className="hero__title">
          Softnox ile dijital çözümlerinizi <span className="grad-text">güçlendirin.</span>
        </h1>
        <p className="hero__sub">
          Kurumsal yazılım, web uygulamaları, mobil çözümler ve özel otomasyon sistemleriyle
          işletmenizin dijital dönüşüm sürecine uçtan uca destek oluyoruz.
        </p>
        <div className="hero__cta">
          <button className="btn btn--primary" onClick={() => onJump("urunler")}>
            Ürünlerimizi İncele <ArrowRight size={16} />
          </button>
          <button className="btn btn--ghost" onClick={() => onJump("iletisim")}>
            İletişime Geç <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="hero__trust">
          {["Özel Yazılım Geliştirme", "Web & Mobil Uygulama", "Kurumsal Çözümler", "7/24 Teknik Destek"].map(t => (
            <div key={t} className="trust-item">
              <Check size={14} /><span>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero__right">
        <HeroVisual />
      </div>
    </div>
    <div className="hero__marquee">
      <div className="marquee__track">
        {[..."01 NEXT.JS · 02 REACT NATIVE · 03 NODE.JS · 04 POSTGRESQL · 05 LARAVEL · 06 .NET · 07 FLUTTER · 08 AWS · 09 DOCKER · 10 TYPESCRIPT".split(" · "),
          ..."01 NEXT.JS · 02 REACT NATIVE · 03 NODE.JS · 04 POSTGRESQL · 05 LARAVEL · 06 .NET · 07 FLUTTER · 08 AWS · 09 DOCKER · 10 TYPESCRIPT".split(" · ")
        ].map((t, i) => (
          <span key={i} className="marquee__item">{t}</span>
        ))}
      </div>
    </div>
  </section>
);

/* ===== About ===== */
const About = () => {
  const stats = [
    { n: "120+", l: "Tamamlanan Proje" },
    { n: "80+", l: "Mutlu Müşteri" },
    { n: "15", l: "Yazılım Çözümü" },
    { n: "7/24", l: "Teknik Destek" },
  ];
  const points = [
    "Müşteri odaklı geliştirme süreçleri",
    "İhtiyaca özel, ölçeklenebilir çözümler",
    "Modern teknolojiler & temiz mimari",
    "Uzun vadeli teknik destek & bakım",
    "Şeffaf ve güvenilir proje yönetimi",
    "Hızlı iterasyon, agile teslimat",
  ];
  return (
    <section id="hakkimizda" className="section">
      <div className="container">
        <SectionHead kicker="01 / Hakkımızda"
          title={<>Teknoloji odaklı bir yazılım<br />ekibi olarak <span className="grad-text">yanınızdayız.</span></>}
          desc="Softnox; işletmelerin dijital ihtiyaçlarına özel yazılım çözümleri geliştiren, ürün odaklı çalışan bir yazılım şirketidir."
        />
        <div className="about__grid">
          <div className="about__points">
            {points.map(p => (
              <div key={p} className="about__point">
                <span className="about__check"><Check size={14} /></span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className="about__stats">
            {stats.map(s => (
              <div key={s.l} className="stat-card">
                <div className="stat-card__n grad-text">{s.n}</div>
                <div className="stat-card__l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===== Products ===== */
const PRODUCTS = [
  { icon: CrmIcon, name: "CRM Yazılımı", tag: "Satış & Müşteri", desc: "Müşteri ilişkilerini, satış süreçlerini ve teklif yönetimini tek panelden takip edin.", feats: ["Lead & fırsat yönetimi", "Teklif & sözleşme", "Görev otomasyonu", "Detaylı raporlama"] },
  { icon: StockIcon, name: "Stok & Depo Sistemi", tag: "Operasyon", desc: "Giriş-çıkış, stok seviyeleri, depo hareketleri ve raporlama için yönetim sistemi.", feats: ["Çoklu depo desteği", "Barkod entegrasyonu", "Otomatik sipariş", "Anlık stok bildirimi"] },
  { icon: CalendarIcon, name: "Randevu & Rezervasyon", tag: "Hizmet", desc: "Klinik, danışmanlık ve hizmet sektörleri için online randevu yönetimi.", feats: ["Online takvim", "SMS / e-posta hatırlatma", "Online ödeme", "Personel yönetimi"] },
  { icon: CartIcon, name: "E-Ticaret Altyapısı", tag: "Ticaret", desc: "Firmaya özel, yönetilebilir, güvenli ve ölçeklenebilir e-ticaret sistemleri.", feats: ["Özel tema & UX", "Pazar yeri entegrasyonu", "Çoklu ödeme", "Kargo entegrasyonları"] },
  { icon: DashIcon, name: "Yönetim Paneli", tag: "Admin", desc: "Web siteleri ve kurumsal sistemler için özel admin panel çözümleri.", feats: ["Rol & yetki yönetimi", "Modüler mimari", "Audit log", "API yönetimi"] },
  { icon: CodeIcon, name: "Özel Yazılım Çözümleri", tag: "Custom", desc: "Firmanın ihtiyacına göre sıfırdan tasarlanan, ölçeklenebilir yazılım projeleri.", feats: ["İş analizi & danışmanlık", "Modern teknoloji stack", "Cloud-native mimari", "Sürekli destek"] },
];

const Products = () => (
  <section id="urunler" className="section section--alt">
    <div className="container">
      <SectionHead kicker="02 / Ürünlerimiz"
        title={<>Hazır altyapımızla <span className="grad-text">hızlı başlayın.</span></>}
        desc="Sektör deneyiminden çıkarılmış, modüler ve özelleştirilebilir ürünlerimizle dijital süreçlerinizi hızla devreye alın."
      />
      <div className="prod-grid">
        {PRODUCTS.map((p, i) => {
          const Ic = p.icon;
          return (
            <article key={p.name} className="prod-card">
              <div className="prod-card__head">
                <span className="prod-card__icon"><Ic size={20} /></span>
                <span className="prod-card__tag">{p.tag}</span>
              </div>
              <h3 className="prod-card__name">{p.name}</h3>
              <p className="prod-card__desc">{p.desc}</p>
              <ul className="prod-card__feats">
                {p.feats.map(f => <li key={f}><span className="dot" />{f}</li>)}
              </ul>
              <button className="prod-card__btn">Detaylı İncele <ArrowUpRight size={14} /></button>
              <span className="prod-card__num">0{i + 1}</span>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

/* ===== Services ===== */
const SERVICES = [
  { icon: WebIcon, name: "Web Sitesi Geliştirme", desc: "Kurumsal web siteleri, tanıtım siteleri, landing page ve özel web arayüzleri." },
  { icon: AppIcon, name: "Web Uygulaması Geliştirme", desc: "Panel, dashboard, müşteri portalı, yönetim sistemi ve SaaS altyapıları." },
  { icon: MobileIcon, name: "Mobil Uygulama Geliştirme", desc: "iOS ve Android platformları için performanslı, kullanıcı dostu mobil uygulamalar." },
  { icon: CodeIcon, name: "Özel Yazılım Geliştirme", desc: "İşletmelerin süreçlerine özel, ölçeklenebilir ve sürdürülebilir yazılım çözümleri." },
  { icon: PaletteIcon, name: "UI / UX Tasarım", desc: "Kullanıcı deneyimini merkeze alan modern, sade ve dönüşüm odaklı arayüzler." },
  { icon: ShieldIcon, name: "Bakım & Teknik Destek", desc: "Geliştirilen projeler için güncelleme, bakım, hata çözümü ve teknik destek." },
];

const Services = () => (
  <section id="hizmetler" className="section">
    <div className="container">
      <SectionHead kicker="03 / Hizmetlerimiz"
        title={<>Uçtan uca <span className="grad-text">yazılım hizmetleri.</span></>}
        desc="Ürün fikrinizden teslimat ve canlı destek sürecine kadar tüm aşamalarda yanınızdayız."
      />
      <div className="svc-grid">
        {SERVICES.map(s => {
          const Ic = s.icon;
          return (
            <article key={s.name} className="svc-card">
              <div className="svc-card__icon"><Ic size={22} /></div>
              <h3 className="svc-card__name">{s.name}</h3>
              <p className="svc-card__desc">{s.desc}</p>
              <div className="svc-card__arrow"><ArrowUpRight size={18} /></div>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

/* ===== Projects ===== */
const PROJECTS = [
  { name: "Kurumsal Web Sitesi", cat: "Web", sector: "İnşaat", stack: ["Next.js", "TypeScript", "Sanity"], desc: "Bir firmanın dijital kimliğini yansıtan modern ve mobil uyumlu kurumsal web sitesi.", accent: "blue" },
  { name: "ERP Yönetim Paneli", cat: "Kurumsal", sector: "Üretim", stack: [".NET", "React", "PostgreSQL"], desc: "Operasyonların tek ekrandan yönetilmesini sağlayan özel dashboard sistemi.", accent: "cyan" },
  { name: "E-Ticaret Platformu", cat: "E-Ticaret", sector: "Retail", stack: ["Laravel", "Vue", "Redis"], desc: "Ürün, sipariş, ödeme ve müşteri süreçlerini yöneten özel e-ticaret altyapısı.", accent: "violet" },
  { name: "Randevu Sistemi", cat: "Web", sector: "Sağlık", stack: ["Next.js", "Node", "Postgres"], desc: "Hizmet sektöründeki işletmeler için geliştirilen online randevu takip sistemi.", accent: "blue" },
  { name: "Saha Mobil Uygulaması", cat: "Mobil", sector: "Lojistik", stack: ["React Native", "Expo", "GraphQL"], desc: "Saha ekipleri için offline-first çalışan, görev takip ve raporlama uygulaması.", accent: "cyan" },
  { name: "Üretim Otomasyonu", cat: "Otomasyon", sector: "Endüstri", stack: ["Python", "MQTT", "Grafana"], desc: "IoT sensörleriyle entegre, gerçek zamanlı üretim hattı izleme ve uyarı sistemi.", accent: "violet" },
];
const FILTERS = ["Tümü", "Web", "Mobil", "Kurumsal", "E-Ticaret", "Otomasyon"];

const ProjVisual = ({ accent, cat }: { accent: string; cat: string }) => {
  const map: Record<string, { from: string; to: string; glow: string }> = {
    blue: { from: "#0b1a3a", to: "#1e3a8a", glow: "#3b82f6" },
    cyan: { from: "#082a33", to: "#0e7490", glow: "#22d3ee" },
    violet: { from: "#1a103a", to: "#5b21b6", glow: "#a78bfa" },
  };
  const c = map[accent];
  return (
    <div className="proj-vis" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
      <div className="proj-vis__glow" style={{ background: c.glow }} />
      <div className="proj-vis__chrome">
        <div className="hv__dots"><i /><i /><i /></div>
        <span className="proj-vis__path">softnox / {cat.toLowerCase()}</span>
      </div>
      {cat === "Mobil" ? (
        <div className="proj-vis__mob">
          <div className="mob__notch" />
          <div className="mob__bar" />
          <div className="mob__bar mob__bar--sm" />
          <div className="mob__grid"><div /><div /><div /><div /></div>
          <div className="mob__bar" />
        </div>
      ) : cat === "Otomasyon" ? (
        <div className="proj-vis__auto">
          <svg viewBox="0 0 200 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
            <polyline points="0,80 25,60 50,70 75,40 100,55 125,25 150,45 175,20 200,35" stroke={c.glow} strokeWidth="2" fill="none" strokeLinecap="round" />
            <polyline points="0,90 25,80 50,85 75,70 100,75 125,55 150,65 175,50 200,55" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="3 3" />
          </svg>
        </div>
      ) : cat === "E-Ticaret" ? (
        <div className="proj-vis__shop">
          <div className="shop__tile" /><div className="shop__tile" /><div className="shop__tile" />
          <div className="shop__tile" /><div className="shop__tile" /><div className="shop__tile" />
        </div>
      ) : (
        <div className="proj-vis__web">
          <div className="web__hero" />
          <div className="web__row"><div /><div /><div /></div>
          <div className="web__bar" />
        </div>
      )}
    </div>
  );
};

const Projects = () => {
  const [filter, setFilter] = useState("Tümü");
  const list = useMemo(() => filter === "Tümü" ? PROJECTS : PROJECTS.filter(p => p.cat === filter), [filter]);
  return (
    <section id="projeler" className="section section--alt">
      <div className="container">
        <SectionHead kicker="04 / Projeler"
          title={<>Yaptığımız <span className="grad-text">işlerden bir seçki.</span></>}
          desc="Farklı sektörlerden firmaların dijital dönüşüm yolculuğunda hayata geçirdiğimiz projeler."
        />
        <div className="filters">
          {FILTERS.map(f => (
            <button key={f} className={`filter ${filter === f ? "is-active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="proj-grid">
          {list.map(p => (
            <article key={p.name} className={`proj-card proj-card--${p.accent}`}>
              <ProjVisual accent={p.accent} cat={p.cat} />
              <div className="proj-card__body">
                <div className="proj-card__meta">
                  <span>{p.sector}</span><span className="sep">·</span><span>{p.cat}</span>
                </div>
                <h3 className="proj-card__name">{p.name}</h3>
                <p className="proj-card__desc">{p.desc}</p>
                <div className="proj-card__stack">
                  {p.stack.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
                <button className="proj-card__btn">Projeyi İncele <ArrowUpRight size={14} /></button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ===== Process ===== */
const PROCESS = [
  { n: "01", t: "Keşif & Analiz", d: "İş sürecinizi, hedef kitlenizi ve teknik ihtiyaçlarınızı haritalandırırız." },
  { n: "02", t: "Tasarım & Prototip", d: "UI/UX akışlarını, ekran tasarımlarını ve interaktif prototipi hazırlarız." },
  { n: "03", t: "Geliştirme", d: "Çevik döngülerde, test odaklı ve şeffaf bir şekilde kod yazarız." },
  { n: "04", t: "Lansman & Destek", d: "Canlıya alır, izler, ölçer ve uzun vadeli destek ile yanınızda dururuz." },
];
const Process = () => (
  <section className="section" id="surec">
    <div className="container">
      <SectionHead kicker="05 / Çalışma Sürecimiz"
        title={<>Net, şeffaf ve <span className="grad-text">öngörülebilir.</span></>}
        desc="Her projede aynı disiplinli akışı izleriz; siz neyin ne zaman geleceğini bilirsiniz."
      />
      <div className="process">
        {PROCESS.map((p, i) => (
          <div key={p.n} className="process__step">
            <div className="process__top">
              <span className="process__num">{p.n}</span>
              {i < PROCESS.length - 1 && <span className="process__line" />}
            </div>
            <h4 className="process__title">{p.t}</h4>
            <p className="process__desc">{p.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ===== Clients ===== */
const CLIENTS = ["Aurora", "Kuvant", "Nordex", "Polaris", "Veridian", "Magnetic", "Helix Co.", "Northwind", "Stellaris", "Lattice", "Ovonics", "Cobalt"];
const ClientMark = ({ variant }: { variant: number }) => {
  const variants = [
    () => <><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="2" fill="currentColor" /></>,
    () => <><rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="1.5" /></>,
    () => <><path d="M4 18 L12 6 L20 18 Z" stroke="currentColor" strokeWidth="1.5" fill="none" /><circle cx="12" cy="14" r="1.5" fill="currentColor" /></>,
    () => <><path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" /></>,
  ];
  const Inner = variants[variant];
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><Inner /></svg>;
};
const Clients = () => (
  <section id="referanslar" className="section section--alt">
    <div className="container">
      <SectionHead kicker="06 / Çalıştığımız Kurumlar"
        title={<>Güvenilir <span className="grad-text">iş ortaklarımız.</span></>}
        desc="Farklı sektörlerden kurum ve işletmelerin dijital dönüşüm süreçlerinde çözüm ortağı oluyoruz."
      />
      <div className="clients">
        {CLIENTS.map((c, i) => (
          <div key={c} className="client">
            <ClientMark variant={i % 4} />
            <span className="client__name">{c}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ===== Contact ===== */
const Field = ({ label, value, onChange, type = "text", textarea, err, optional }: any) => {
  const [focus, setFocus] = useState(false);
  const filled = value && value.length > 0;
  return (
    <label className={`field ${focus || filled ? "is-active" : ""} ${err ? "has-err" : ""} ${textarea ? "is-area" : ""}`}>
      <span className="field__lbl">{label}{optional && <em> (opsiyonel)</em>}</span>
      {textarea ? (
        <textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
      )}
      {err && <span className="field__err">{err}</span>}
    </label>
  );
};

const Contact = () => {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (!form.name.trim()) e2.name = "Ad soyad gerekli";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e2.email = "Geçerli bir e-posta giriniz";
    if (!form.msg.trim() || form.msg.length < 10) e2.msg = "Lütfen kısa bir mesaj yazın (min 10 karakter)";
    setErr(e2);
    if (Object.keys(e2).length > 0) return;
    setSending(true);
    setSendErr("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gönderim başarısız");
      setSent(true);
      setForm({ name: "", company: "", email: "", phone: "", msg: "" });
      setTimeout(() => setSent(false), 5000);
    } catch {
      setSendErr("Mesaj gönderilemedi, lütfen tekrar deneyin.");
    } finally {
      setSending(false);
    }
  };
  return (
    <section id="iletisim" className="section">
      <div className="container">
        <div className="contact">
          <div className="contact__left">
            <div className="eyebrow"><span className="eyebrow__dot" /><span>07 / İletişim</span></div>
            <h2 className="section__title">Projenizi birlikte<br /><span className="grad-text">hayata geçirelim.</span></h2>
            <p className="contact__desc">İhtiyacınıza özel yazılım çözümleri için bizimle iletişime geçin.</p>
            <ul className="contact__info">
              <li>
                <a href="mailto:softnoxofficial@gmail.com" style={{ display: "contents", textDecoration: "none", color: "inherit" }}>
                  <span className="contact__ic"><Mail size={16} /></span>
                  <div><span className="ci__lbl">E-posta</span><span className="ci__val">softnoxofficial@gmail.com</span></div>
                </a>
              </li>
              <SitePhoneContact />
              <li>
                <span className="contact__ic"><MapPin size={16} /></span>
                <div><span className="ci__lbl">Adres</span><span className="ci__val">İstanbul & Edirne, Türkiye</span></div>
              </li>
            </ul>
          </div>
          <form className="contact__form" onSubmit={submit} noValidate>
            <div className="form__row">
              <Field label="Ad Soyad" value={form.name} onChange={(v: string) => set("name", v)} err={err.name} />
              <Field label="Firma Adı" value={form.company} onChange={(v: string) => set("company", v)} optional />
            </div>
            <div className="form__row">
              <Field label="E-posta" type="email" value={form.email} onChange={(v: string) => set("email", v)} err={err.email} />
              <Field label="Telefon" type="tel" value={form.phone} onChange={(v: string) => set("phone", v)} optional />
            </div>
            <Field label="Mesajınız" textarea value={form.msg} onChange={(v: string) => set("msg", v)} err={err.msg} />
            <div className="form__foot">
              <span className="form__hint">
                {sendErr ? <span style={{ color: "#f87171" }}>{sendErr}</span> : "Gönderdiğinizde size 24 saat içinde dönüş sağlarız."}
              </span>
              <button className={`btn btn--primary ${sent ? "is-sent" : ""}`} type="submit" disabled={sending}>
                {sent ? <><Check size={16} /> Gönderildi</> : sending ? "Gönderiliyor..." : <>Mesajı Gönder <ArrowRight size={16} /></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

/* ===== Footer ===== */
const Footer = ({ onJump }: { onJump: (id: string) => void }) => (
  <footer className="footer">
    <div className="container">
      <div className="footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>İşletmelerin dijital ihtiyaçlarına özel yazılım çözümleri geliştiren teknoloji odaklı bir yazılım şirketi.</p>
          <div className="footer__social">
            {["in", "X", "gh", "be"].map(s => (
              <a key={s} href="#" aria-label={s}><span>{s}</span></a>
            ))}
          </div>
        </div>
        <div className="footer__col">
          <h5>Menü</h5>
          <ul>{NAV_ITEMS.map(it => (
            <li key={it.id}><a href={`#${it.id}`} onClick={(e) => { e.preventDefault(); onJump(it.id); }}>{it.label}</a></li>
          ))}</ul>
        </div>
        <div className="footer__col">
          <h5>Hizmetler</h5>
          <ul>{SERVICES.map(s => (
            <li key={s.name}><a href="#hizmetler" onClick={(e) => { e.preventDefault(); onJump("hizmetler"); }}>{s.name}</a></li>
          ))}</ul>
        </div>
        <div className="footer__col">
          <h5>İletişim</h5>
          <ul className="footer__info">
            <li><a href="mailto:softnoxofficial@gmail.com" style={{ color: "inherit", textDecoration: "none" }}>softnoxofficial@gmail.com</a></li>
            <li>İstanbul & Edirne, Türkiye</li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2026 Softnox. Tüm hakları saklıdır.</span>
        <span className="footer__legal">
          <a href="#">Gizlilik Politikası</a>
          <a href="#">KVKK Aydınlatma Metni</a>
          <a href="#">Çerez Politikası</a>
        </span>
      </div>
    </div>
  </footer>
);

/* ===== Section Header ===== */
const SectionHead = ({ kicker, title, desc }: { kicker: string; title: React.ReactNode; desc?: string }) => (
  <div className="section__head">
    <div className="eyebrow"><span className="eyebrow__dot" /><span>{kicker}</span></div>
    <h2 className="section__title">{title}</h2>
    {desc && <p className="section__desc">{desc}</p>}
  </div>
);

/* ===== App ===== */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="En üste çık"
      style={{
        position: "fixed",
        bottom: 28,
        right: 24,
        zIndex: 999,
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(59,130,246,0.2))",
        border: "1px solid rgba(59,130,246,0.4)",
        color: "#22d3ee",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(59,130,246,0.25)",
        transition: "opacity 0.3s, transform 0.3s",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
      </svg>
    </button>
  );
}

export default function SiteApp() {
  const [active, setActive] = useState("anasayfa");
  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "smooth" });
  };
  useEffect(() => {
    const ids = NAV_ITEMS.map(n => n.id);
    const obs = new IntersectionObserver((entries) => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.2, 0.5, 1] });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return (
    <>
      <Nav active={active} onJump={jump} />
      <main>
        <Hero onJump={jump} />
        <About />
        <Products />
        <Services />
        <Projects />
        <Process />
        <Clients />
        <Contact />
      </main>
      <Footer onJump={jump} />
      <ScrollToTop />
    </>
  );
}

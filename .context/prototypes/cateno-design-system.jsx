import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Star, Search, Bell, Users, Settings, FileText, BarChart3, Shield, Zap, CreditCard, Activity, Layers, X, Menu, Home, ArrowRight, Sparkles, Eye, Building2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════
//  CATENO DESIGN SYSTEM
//  Extraído da identidade visual oficial cateno.com.br
//  Versão 1.0 — Abril 2026
// ═══════════════════════════════════════════════════════════

// ─── Design Tokens ──────────────────────────────────────
const tokens = {
  // ── Cores Primárias ──
  color: {
    // Teal — Cor principal da marca
    teal: {
      50:  "#F0FDFA",   // Background de página
      100: "#CCFBF1",   // Highlight sutil
      200: "#99F6E4",   // Hover leve
      300: "#5EEAD4",   // Bordas ativas
      400: "#2DD4BF",   // Ícones secundários
      500: "#14B8A6",   // Background login, CTA secundário
      600: "#0D9488",   // COR PRINCIPAL — botões, links, toggles, sidebar ativa
      700: "#0F766E",   // Hover de botões
      800: "#115E59",   // Texto sobre fundo claro
      900: "#134E4A",   // Texto forte
    },
    // Neutros
    neutral: {
      0:   "#FFFFFF",   // Cards, superfícies
      50:  "#F8FAFC",   // Background alternativo
      100: "#F1F5F9",   // Hover de linhas de tabela
      200: "#E2E8F0",   // Bordas, divisores
      300: "#CBD5E1",   // Ícones desabilitados
      400: "#94A3B8",   // Placeholder text
      500: "#64748B",   // Texto secundário
      600: "#475569",   // Texto terciário
      700: "#334155",   // Texto corpo
      800: "#1E293B",   // Texto principal, headings
      900: "#0F172A",   // Texto mais escuro
    },
    // Acentos
    lime: {
      300: "#BEF264",   // Tags de ferramentas
      400: "#A3E635",   // Tags hover
      500: "#84CC16",   // Badges positivos
    },
    // Semânticas
    success: "#10B981",
    warning: "#F59E0B",
    danger:  "#EF4444",
    info:    "#0D9488",
  },

  // ── Tipografia ──
  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    size: {
      xs:   "11px",
      sm:   "13px",
      base: "14px",
      md:   "15px",
      lg:   "16px",
      xl:   "18px",
      "2xl": "20px",
      "3xl": "24px",
      "4xl": "30px",
      "5xl": "36px",
    },
    weight: {
      regular: 400,
      medium:  500,
      semibold: 600,
      bold:    700,
      extrabold: 800,
    },
    lineHeight: {
      tight:  1.25,
      normal: 1.5,
      relaxed: 1.625,
    },
  },

  // ── Espaçamento ──
  spacing: {
    0: "0px", 1: "4px", 2: "8px", 3: "12px", 4: "16px",
    5: "20px", 6: "24px", 7: "28px", 8: "32px", 10: "40px",
    12: "48px", 16: "64px", 20: "80px",
  },

  // ── Bordas ──
  radius: {
    sm:   "6px",
    md:   "8px",
    lg:   "12px",
    xl:   "16px",
    "2xl": "20px",
    full: "9999px",
  },

  // ── Sombras ──
  shadow: {
    sm:    "0 1px 2px rgba(0, 0, 0, 0.05)",
    md:    "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    lg:    "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
    xl:    "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
    glow:  "0 0 20px rgba(13, 148, 136, 0.15)",
    card:  "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
  },

  // ── Transições ──
  transition: {
    fast:   "all 0.15s ease",
    normal: "all 0.25s ease",
    slow:   "all 0.35s ease",
  },
};

// ─── Semantic Aliases ───────────────────────────────────
const semantic = {
  bg: {
    page:      tokens.color.teal[50],
    card:      tokens.color.neutral[0],
    sidebar:   tokens.color.neutral[0],
    header:    tokens.color.neutral[0],
    hover:     tokens.color.neutral[100],
    active:    tokens.color.teal[600],
    muted:     tokens.color.neutral[50],
    input:     tokens.color.neutral[0],
  },
  text: {
    primary:   tokens.color.neutral[800],
    secondary: tokens.color.neutral[500],
    muted:     tokens.color.neutral[400],
    inverse:   tokens.color.neutral[0],
    link:      tokens.color.teal[600],
    heading:   tokens.color.neutral[900],
  },
  border: {
    default:   tokens.color.neutral[200],
    hover:     tokens.color.teal[300],
    focus:     tokens.color.teal[600],
    subtle:    tokens.color.neutral[100],
  },
  button: {
    primary:   { bg: tokens.color.teal[600], hover: tokens.color.teal[700], text: "#FFFFFF" },
    secondary: { bg: tokens.color.neutral[0], hover: tokens.color.neutral[50], text: tokens.color.neutral[800], border: tokens.color.neutral[200] },
    ghost:     { bg: "transparent", hover: tokens.color.teal[50], text: tokens.color.teal[600] },
    danger:    { bg: tokens.color.danger, hover: "#DC2626", text: "#FFFFFF" },
  },
};

// ─── Logo SVG Component ─────────────────────────────────
function CatenoLogo({ size = "md", variant = "full" }) {
  const sizes = { sm: { h: 28, w: 90 }, md: { h: 36, w: 120 }, lg: { h: 48, w: 160 } };
  const s = sizes[size];
  return (
    <svg viewBox="0 0 160 48" width={s.w} height={s.h} fill="none">
      {/* Ondas do logo */}
      <path d="M20 8 C28 4, 36 4, 44 8 C52 12, 60 12, 68 8 C76 4, 84 4, 92 8" stroke="#D4C73E" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M16 14 C24 10, 32 10, 40 14 C48 18, 56 18, 64 14 C72 10, 80 10, 88 14" stroke="#5BB89C" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M12 20 C20 16, 28 16, 36 20 C44 24, 52 24, 60 20 C68 16, 76 16, 84 20" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9"/>
      {/* Texto cateno */}
      {variant === "full" && (
        <text x="12" y="42" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="700" fill="#334155" letterSpacing="-0.5">cateno</text>
      )}
    </svg>
  );
}

// ─── Helper: Clipboard ──────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} style={{
      background: "none", border: "none", cursor: "pointer", padding: 4,
      color: copied ? tokens.color.success : tokens.color.neutral[400],
      transition: tokens.transition.fast,
    }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

// ─── Color Swatch ───────────────────────────────────────
function Swatch({ name, hex, large }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <div style={{
        width: large ? 56 : 40, height: large ? 56 : 40, borderRadius: tokens.radius.md,
        background: hex, border: `1px solid ${tokens.color.neutral[200]}`,
        boxShadow: tokens.shadow.sm, flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.semibold, color: tokens.color.neutral[800] }}>{name}</div>
        <div style={{ fontSize: tokens.font.size.xs, color: tokens.color.neutral[500], fontFamily: "monospace" }}>{hex}</div>
      </div>
      <CopyButton text={hex} />
    </div>
  );
}

// ─── Section Component ──────────────────────────────────
function Section({ title, description, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{
        fontSize: tokens.font.size["2xl"], fontWeight: tokens.font.weight.bold,
        color: tokens.color.neutral[900], marginBottom: 4,
      }}>{title}</h2>
      {description && (
        <p style={{ fontSize: tokens.font.size.base, color: tokens.color.neutral[500], marginBottom: 24, lineHeight: tokens.font.lineHeight.relaxed }}>{description}</p>
      )}
      {children}
    </div>
  );
}

// ─── Component Preview ──────────────────────────────────
function ComponentBox({ label, children }) {
  return (
    <div style={{
      background: tokens.color.neutral[0], border: `1px solid ${tokens.color.neutral[200]}`,
      borderRadius: tokens.radius.xl, padding: 24, marginBottom: 16,
    }}>
      <div style={{ fontSize: tokens.font.size.xs, fontWeight: tokens.font.weight.semibold, color: tokens.color.neutral[400], textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 16 }}>{label}</div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  DESIGN SYSTEM PAGE
// ═══════════════════════════════════════════════════════════
export default function CatenoDesignSystem() {
  const [activeSection, setActiveSection] = useState("colors");

  const nav = [
    { id: "colors", label: "Cores", icon: Eye },
    { id: "typography", label: "Tipografia", icon: FileText },
    { id: "components", label: "Componentes", icon: Layers },
    { id: "patterns", label: "Padrões", icon: Activity },
  ];

  return (
    <div style={{ fontFamily: tokens.font.family, background: tokens.color.teal[50], minHeight: "100vh", color: tokens.color.neutral[800] }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${tokens.color.neutral[300]}; border-radius: 3px; }
        .ds-nav-item:hover { background: ${tokens.color.teal[50]} !important; }
        .ds-btn-primary:hover { background: ${tokens.color.teal[700]} !important; }
        .ds-btn-secondary:hover { background: ${tokens.color.neutral[50]} !important; }
        .ds-card:hover { border-color: ${tokens.color.teal[300]} !important; box-shadow: ${tokens.shadow.lg} !important; }
      `}</style>

      {/* ─── Header ─── */}
      <header style={{
        background: tokens.color.neutral[0], borderBottom: `1px solid ${tokens.color.neutral[200]}`,
        padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <CatenoLogo size="md" />
          <div style={{ width: 1, height: 28, background: tokens.color.neutral[200] }} />
          <span style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, color: tokens.color.neutral[800] }}>Design System</span>
          <span style={{
            fontSize: tokens.font.size.xs, fontWeight: tokens.font.weight.semibold,
            background: tokens.color.teal[50], color: tokens.color.teal[600],
            padding: "3px 10px", borderRadius: tokens.radius.full,
          }}>v1.0</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} className="ds-nav-item" onClick={() => setActiveSection(id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              borderRadius: tokens.radius.md, border: "none", cursor: "pointer",
              background: activeSection === id ? tokens.color.teal[600] : "transparent",
              color: activeSection === id ? "#FFF" : tokens.color.neutral[500],
              fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium,
              transition: tokens.transition.fast,
            }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px" }}>

        {/* ═══ CORES ═══ */}
        {activeSection === "colors" && (
          <>
            <Section title="Paleta de Cores" description="Cores extraídas da identidade visual oficial da Cateno. A cor teal é o elemento central da marca.">

              {/* Cor Principal */}
              <ComponentBox label="Cor Principal — Teal 600">
                <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: tokens.radius.xl,
                    background: tokens.color.teal[600], display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: tokens.shadow.glow,
                  }}>
                    <span style={{ color: "#FFF", fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.bold }}>
                      #0D9488
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.bold, marginBottom: 8 }}>
                      Teal 600 — Cor primária da Cateno
                    </div>
                    <div style={{ fontSize: tokens.font.size.base, color: tokens.color.neutral[500], lineHeight: 1.6 }}>
                      Usada em botões primários, links, toggles ativos, sidebar ativa, ícones de ação e elementos interativos principais. Esta é a cor que define a identidade visual da Cateno em todas as interfaces.
                    </div>
                  </div>
                </div>
              </ComponentBox>

              {/* Escala Teal */}
              <ComponentBox label="Escala Teal — Completa">
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {Object.entries(tokens.color.teal).map(([k, v]) => (
                    <div key={k} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        height: 64, borderRadius: tokens.radius.md, background: v,
                        border: k === "50" ? `1px solid ${tokens.color.neutral[200]}` : "none",
                        marginBottom: 8,
                      }} />
                      <div style={{ fontSize: 10, fontWeight: 600, color: tokens.color.neutral[500] }}>{k}</div>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: tokens.color.neutral[400] }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: tokens.font.size.sm, color: tokens.color.neutral[500] }}>
                  <strong>50</strong> — Background de página &nbsp;|&nbsp; <strong>500</strong> — Background login &nbsp;|&nbsp; <strong>600</strong> — Botões e links &nbsp;|&nbsp; <strong>700</strong> — Hover state
                </div>
              </ComponentBox>

              {/* Neutros */}
              <ComponentBox label="Escala Neutra">
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {Object.entries(tokens.color.neutral).map(([k, v]) => (
                    <div key={k} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        height: 64, borderRadius: tokens.radius.md, background: v,
                        border: `1px solid ${tokens.color.neutral[200]}`, marginBottom: 8,
                      }} />
                      <div style={{ fontSize: 10, fontWeight: 600, color: tokens.color.neutral[500] }}>{k}</div>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: tokens.color.neutral[400] }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: tokens.font.size.sm, color: tokens.color.neutral[500] }}>
                  <strong>0</strong> — Cards &nbsp;|&nbsp; <strong>200</strong> — Bordas &nbsp;|&nbsp; <strong>500</strong> — Texto secundário &nbsp;|&nbsp; <strong>800</strong> — Texto principal
                </div>
              </ComponentBox>

              {/* Cores Semânticas + Lime */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <ComponentBox label="Cores Semânticas">
                  <Swatch name="Success" hex={tokens.color.success} />
                  <Swatch name="Warning" hex={tokens.color.warning} />
                  <Swatch name="Danger" hex={tokens.color.danger} />
                  <Swatch name="Info" hex={tokens.color.info} />
                </ComponentBox>
                <ComponentBox label="Accent — Lime (Tags)">
                  <Swatch name="Lime 300 — Tags" hex={tokens.color.lime[300]} large />
                  <Swatch name="Lime 400 — Tags Hover" hex={tokens.color.lime[400]} />
                  <Swatch name="Lime 500 — Badges" hex={tokens.color.lime[500]} />
                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["API Gateway", "DBeaver", "Power BI", "DB2"].map((t) => (
                      <span key={t} style={{
                        background: tokens.color.lime[300], color: tokens.color.neutral[800],
                        padding: "4px 12px", borderRadius: tokens.radius.full,
                        fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium,
                      }}>{t}</span>
                    ))}
                  </div>
                </ComponentBox>
              </div>
            </Section>
          </>
        )}

        {/* ═══ TIPOGRAFIA ═══ */}
        {activeSection === "typography" && (
          <Section title="Tipografia" description="Inter como fonte principal. Hierarquia clara de tamanhos e pesos para interfaces de gestão.">
            <ComponentBox label="Escala Tipográfica">
              {[
                { name: "Display", size: "36px", weight: 800, sample: "Portal Cateno" },
                { name: "Heading 1", size: "30px", weight: 700, sample: "Gestão de Vagas" },
                { name: "Heading 2", size: "24px", weight: 700, sample: "Papéis e Permissões" },
                { name: "Heading 3", size: "20px", weight: 600, sample: "Informações do Projeto" },
                { name: "Heading 4", size: "18px", weight: 600, sample: "Descrição da Função" },
                { name: "Body Large", size: "16px", weight: 400, sample: "Transformar dados complexos em dashboards e relatórios visuais intuitivos." },
                { name: "Body", size: "14px", weight: 400, sample: "Aqui você pode solicitar, acompanhar e gerenciar suas demandas de vaga com praticidade." },
                { name: "Small", size: "13px", weight: 500, sample: "Mostrando 1-5 de 43 registros" },
                { name: "Caption", size: "11px", weight: 600, sample: "RESULTADOS POR PÁGINA" },
              ].map((t) => (
                <div key={t.name} style={{ display: "flex", alignItems: "baseline", gap: 20, padding: "14px 0", borderBottom: `1px solid ${tokens.color.neutral[100]}` }}>
                  <div style={{ width: 100, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: tokens.color.teal[600] }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: tokens.color.neutral[400], fontFamily: "monospace" }}>{t.size} / {t.weight}</div>
                  </div>
                  <div style={{ fontSize: t.size, fontWeight: t.weight, color: tokens.color.neutral[800], lineHeight: 1.5 }}>{t.sample}</div>
                </div>
              ))}
            </ComponentBox>

            <ComponentBox label="Font Stack">
              <div style={{ fontFamily: "monospace", fontSize: 13, color: tokens.color.neutral[600], background: tokens.color.neutral[50], padding: 16, borderRadius: tokens.radius.md, lineHeight: 1.8 }}>
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              </div>
            </ComponentBox>
          </Section>
        )}

        {/* ═══ COMPONENTES ═══ */}
        {activeSection === "components" && (
          <Section title="Componentes" description="Biblioteca de componentes baseada nos padrões visuais existentes da Cateno.">

            {/* Botões */}
            <ComponentBox label="Botões">
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
                <button className="ds-btn-primary" style={{
                  background: tokens.color.teal[600], color: "#FFF", border: "none",
                  padding: "10px 24px", borderRadius: tokens.radius.md, fontSize: tokens.font.size.base,
                  fontWeight: tokens.font.weight.semibold, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  transition: tokens.transition.fast,
                }}>
                  <Zap size={16} /> Avançar <ArrowRight size={16} />
                </button>
                <button className="ds-btn-secondary" style={{
                  background: tokens.color.neutral[0], color: tokens.color.neutral[800],
                  border: `1px solid ${tokens.color.neutral[200]}`,
                  padding: "10px 24px", borderRadius: tokens.radius.md, fontSize: tokens.font.size.base,
                  fontWeight: tokens.font.weight.medium, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  transition: tokens.transition.fast,
                }}>
                  <ArrowRight size={16} style={{ transform: "rotate(180deg)" }} /> Voltar
                </button>
                <button style={{
                  background: "transparent", color: tokens.color.teal[600], border: "none",
                  padding: "10px 24px", borderRadius: tokens.radius.md, fontSize: tokens.font.size.base,
                  fontWeight: tokens.font.weight.medium, cursor: "pointer",
                }}>
                  Cancelar
                </button>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button className="ds-btn-primary" style={{
                  background: tokens.color.teal[600], color: "#FFF", border: "none",
                  padding: "10px 20px", borderRadius: tokens.radius.md, fontSize: tokens.font.size.sm,
                  fontWeight: tokens.font.weight.semibold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                }}>
                  + Criar papel
                </button>
                <button className="ds-btn-primary" style={{
                  background: tokens.color.teal[600], color: "#FFF", border: "none",
                  padding: "10px 20px", borderRadius: tokens.radius.md, fontSize: tokens.font.size.sm,
                  fontWeight: tokens.font.weight.semibold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                }}>
                  + Criar usuário
                </button>
                <button className="ds-btn-primary" style={{
                  background: tokens.color.teal[600], color: "#FFF", border: "none",
                  padding: "10px 20px", borderRadius: tokens.radius.md, fontSize: tokens.font.size.sm,
                  fontWeight: tokens.font.weight.semibold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                }}>
                  Exportar XLS
                </button>
              </div>
            </ComponentBox>

            {/* Toggle/Switch */}
            <ComponentBox label="Toggle Switch">
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                {[true, false].map((on, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                      background: on ? tokens.color.teal[600] : tokens.color.neutral[300],
                      padding: 2, transition: tokens.transition.fast, position: "relative",
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", background: "#FFF",
                        transform: on ? "translateX(20px)" : "translateX(0)",
                        transition: tokens.transition.fast, boxShadow: tokens.shadow.sm,
                      }} />
                    </div>
                    <span style={{ fontSize: tokens.font.size.sm, color: on ? tokens.color.teal[600] : tokens.color.neutral[500], fontWeight: 600 }}>
                      {on ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                ))}
              </div>
            </ComponentBox>

            {/* Tabs */}
            <ComponentBox label="Tabs">
              <div style={{ display: "flex", gap: 0, background: tokens.color.neutral[100], borderRadius: tokens.radius.md, padding: 4, width: "fit-content" }}>
                {["Performance de Vagas", "Performance de Fornecedores"].map((tab, i) => (
                  <button key={tab} style={{
                    padding: "8px 20px", borderRadius: tokens.radius.sm, border: "none", cursor: "pointer",
                    background: i === 0 ? tokens.color.teal[600] : "transparent",
                    color: i === 0 ? "#FFF" : tokens.color.neutral[500],
                    fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium,
                    transition: tokens.transition.fast,
                  }}>{tab}</button>
                ))}
              </div>
            </ComponentBox>

            {/* Input */}
            <ComponentBox label="Inputs">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.semibold, color: tokens.color.neutral[800], display: "block", marginBottom: 6 }}>Nome do projeto</label>
                  <input type="text" placeholder="Digite o nome" style={{
                    width: "100%", padding: "10px 14px", borderRadius: tokens.radius.md,
                    border: `1px solid ${tokens.color.neutral[200]}`, fontSize: tokens.font.size.base,
                    color: tokens.color.neutral[800], outline: "none", fontFamily: tokens.font.family,
                    background: tokens.color.neutral[0],
                  }} />
                </div>
                <div>
                  <label style={{ fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.semibold, color: tokens.color.neutral[800], display: "block", marginBottom: 6 }}>Classificação</label>
                  <div style={{
                    padding: "10px 14px", borderRadius: tokens.radius.md,
                    border: `1px solid ${tokens.color.neutral[200]}`, fontSize: tokens.font.size.base,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    color: tokens.color.neutral[400], background: tokens.color.neutral[0],
                  }}>
                    Selecionar <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </ComponentBox>

            {/* Card */}
            <ComponentBox label="Cards">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {[
                  { icon: Users, label: "Usuários", desc: "Gestão de usuários do sistema" },
                  { icon: FileText, label: "Projetos", desc: "Gerenciar projetos e iniciativas" },
                  { icon: BarChart3, label: "Relatórios", desc: "Dashboards e exportações" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="ds-card" style={{
                    background: tokens.color.neutral[0], borderRadius: tokens.radius.xl,
                    padding: 24, border: `1px solid ${tokens.color.neutral[200]}`,
                    cursor: "pointer", transition: tokens.transition.normal,
                  }}>
                    <Icon size={28} color={tokens.color.teal[600]} style={{ marginBottom: 14 }} />
                    <div style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.bold, color: tokens.color.neutral[800], marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: tokens.font.size.sm, color: tokens.color.neutral[500], lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </ComponentBox>

            {/* Badges & Tags */}
            <ComponentBox label="Badges & Tags">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ background: tokens.color.teal[50], color: tokens.color.teal[700], padding: "4px 12px", borderRadius: tokens.radius.full, fontSize: tokens.font.size.sm, fontWeight: 600 }}>Online</span>
                <span style={{ background: "#FEF3C7", color: "#B45309", padding: "4px 12px", borderRadius: tokens.radius.full, fontSize: tokens.font.size.sm, fontWeight: 600 }}>Manutenção</span>
                <span style={{ background: "#FEE2E2", color: "#DC2626", padding: "4px 12px", borderRadius: tokens.radius.full, fontSize: tokens.font.size.sm, fontWeight: 600 }}>Offline</span>
                <span style={{ background: tokens.color.lime[300], color: tokens.color.neutral[800], padding: "4px 12px", borderRadius: tokens.radius.full, fontSize: tokens.font.size.sm, fontWeight: 500 }}>Júnior</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["API Gateway", "DBeaver", "Data Gateway", "DB2", "Power BI", "Qlik Sense", "SharePoint"].map((t) => (
                  <span key={t} style={{
                    background: tokens.color.lime[300], color: tokens.color.neutral[800],
                    padding: "5px 14px", borderRadius: tokens.radius.full,
                    fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium,
                  }}>{t}</span>
                ))}
              </div>
            </ComponentBox>

            {/* Checkbox */}
            <ComponentBox label="Checkboxes">
              <div style={{ display: "flex", gap: 24 }}>
                {[
                  { label: "Criar Usuário", checked: true },
                  { label: "Editar Usuário", checked: true },
                  { label: "Criar Papel", checked: false },
                  { label: "Listar Papéis", checked: false },
                ].map(({ label, checked }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4,
                      background: checked ? tokens.color.teal[600] : tokens.color.neutral[0],
                      border: checked ? "none" : `2px solid ${tokens.color.neutral[300]}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {checked && <Check size={14} color="#FFF" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: tokens.font.size.base, color: tokens.color.neutral[700] }}>{label}</span>
                  </div>
                ))}
              </div>
            </ComponentBox>
          </Section>
        )}

        {/* ═══ PADRÕES ═══ */}
        {activeSection === "patterns" && (
          <Section title="Padrões de Interface" description="Padrões recorrentes extraídos das telas da Cateno.">

            <ComponentBox label="Sidebar Navigation">
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{
                  width: 240, background: tokens.color.neutral[0], borderRadius: tokens.radius.xl,
                  border: `1px solid ${tokens.color.neutral[200]}`, padding: "16px 8px",
                }}>
                  {[
                    { icon: Home, label: "Home", active: true },
                    { icon: Shield, label: "Papéis e permissões", active: false },
                    { icon: Users, label: "Usuários", active: false },
                    { icon: FileText, label: "Projetos", active: false },
                    { icon: CreditCard, label: "Empresas", active: false },
                    { icon: Star, label: "Perfil de vagas", active: false },
                    { icon: BarChart3, label: "Relatórios", active: false },
                  ].map(({ icon: Icon, label, active }) => (
                    <div key={label} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: tokens.radius.md, marginBottom: 2,
                      background: active ? tokens.color.teal[600] : "transparent",
                      color: active ? "#FFF" : tokens.color.neutral[600],
                      fontSize: tokens.font.size.sm, fontWeight: active ? 600 : 500,
                      cursor: "pointer",
                    }}>
                      <Icon size={18} /> {label}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, fontSize: tokens.font.size.sm, color: tokens.color.neutral[500], lineHeight: 1.8 }}>
                  <strong style={{ color: tokens.color.neutral[800] }}>Regras:</strong><br />
                  — Item ativo usa background Teal 600 com texto branco<br />
                  — Itens inativos usam texto Neutral 600<br />
                  — Hover mostra background Teal 50<br />
                  — Ícone à esquerda, 18px<br />
                  — Border radius md (8px) em cada item<br />
                  — Sidebar tem fundo branco com borda Neutral 200
                </div>
              </div>
            </ComponentBox>

            <ComponentBox label="Collapsed Sidebar (Ícones)">
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{
                  width: 64, background: tokens.color.neutral[0], borderRadius: tokens.radius.xl,
                  border: `1px solid ${tokens.color.neutral[200]}`, padding: "16px 0",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}>
                  {/* Hamburger */}
                  <div style={{
                    width: 40, height: 40, borderRadius: tokens.radius.md, marginBottom: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: tokens.color.neutral[500],
                  }}>
                    <Menu size={20} />
                  </div>
                  {/* Nav items */}
                  {[
                    { icon: Home, active: false },
                    { icon: Shield, active: true },
                    { icon: Users, active: false },
                    { icon: CreditCard, active: false },
                    { icon: Building2, active: false },
                    { icon: Star, active: false },
                    { icon: FileText, active: false },
                    { icon: Settings, active: false },
                    { icon: BarChart3, active: false },
                    { icon: Activity, active: false },
                  ].map(({ icon: Icon, active }, idx) => (
                    <div key={idx} style={{
                      width: 40, height: 40, borderRadius: tokens.radius.md,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: active ? tokens.color.teal[600] : "transparent",
                      color: active ? "#FFF" : tokens.color.neutral[500],
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}>
                      <Icon size={20} />
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, fontSize: tokens.font.size.sm, color: tokens.color.neutral[500], lineHeight: 1.8 }}>
                  <strong style={{ color: tokens.color.neutral[800] }}>Collapsed Sidebar — Regras:</strong><br />
                  — Largura fixa: <strong>64px</strong><br />
                  — Apenas ícones, sem labels<br />
                  — Ícone ativo: fundo <strong>Teal 600</strong>, ícone branco, border-radius 8px<br />
                  — Ícones inativos: cor <strong>Neutral 500</strong>, sem fundo<br />
                  — Hover: fundo <strong>Teal 50</strong> no ícone<br />
                  — Botão hamburger (☰) no topo para expandir<br />
                  — Tooltip com label aparece no hover de cada ícone<br />
                  — Ícones: 20px, área clicável 40×40px<br />
                  — Fundo branco, borda direita <strong>Neutral 200</strong><br />
                  — Transição expand/collapse: <strong>0.25s ease</strong><br />
                  — Ao expandir: largura vai para <strong>240px</strong>, labels aparecem com fade-in
                </div>
              </div>
            </ComponentBox>

            <ComponentBox label="Sidebar — Comparação Expandida vs Collapsed">
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Expanded */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: tokens.color.teal[600], textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, textAlign: "center" }}>Expandida (240px)</div>
                  <div style={{
                    width: 220, background: tokens.color.neutral[0], borderRadius: tokens.radius.lg,
                    border: `1px solid ${tokens.color.neutral[200]}`, padding: "10px 6px",
                  }}>
                    {[
                      { icon: Home, label: "Home", active: true },
                      { icon: Shield, label: "Papéis e permissões", active: false },
                      { icon: Users, label: "Usuários", active: false },
                    ].map(({ icon: Icon, label, active }) => (
                      <div key={label} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px", borderRadius: tokens.radius.md, marginBottom: 1,
                        background: active ? tokens.color.teal[600] : "transparent",
                        color: active ? "#FFF" : tokens.color.neutral[600],
                        fontSize: tokens.font.size.sm, fontWeight: active ? 600 : 500,
                      }}>
                        <Icon size={18} /> {label}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Arrow */}
                <div style={{ display: "flex", alignItems: "center", paddingTop: 50, color: tokens.color.neutral[400] }}>
                  <ArrowRight size={20} />
                </div>
                {/* Collapsed */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: tokens.color.teal[600], textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, textAlign: "center" }}>Collapsed (64px)</div>
                  <div style={{
                    width: 56, background: tokens.color.neutral[0], borderRadius: tokens.radius.lg,
                    border: `1px solid ${tokens.color.neutral[200]}`, padding: "10px 0",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  }}>
                    {[
                      { icon: Home, active: true },
                      { icon: Shield, active: false },
                      { icon: Users, active: false },
                    ].map(({ icon: Icon, active }, idx) => (
                      <div key={idx} style={{
                        width: 36, height: 36, borderRadius: tokens.radius.md,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: active ? tokens.color.teal[600] : "transparent",
                        color: active ? "#FFF" : tokens.color.neutral[500],
                      }}>
                        <Icon size={18} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Specs */}
                <div style={{ flex: 1, paddingTop: 20 }}>
                  <div style={{
                    background: tokens.color.neutral[50], borderRadius: tokens.radius.md, padding: 14,
                    fontFamily: "monospace", fontSize: 12, lineHeight: 2, color: tokens.color.neutral[600],
                  }}>
                    <span style={{ color: tokens.color.teal[600] }}>/* CSS transition */</span><br/>
                    width: 240px → 64px;<br/>
                    transition: width 0.25s ease;<br/>
                    overflow: hidden;<br/><br/>
                    <span style={{ color: tokens.color.teal[600] }}>/* Label fade */</span><br/>
                    .nav-label {"{"}<br/>
                    &nbsp;&nbsp;opacity: 1 → 0;<br/>
                    &nbsp;&nbsp;transition: opacity 0.15s ease;<br/>
                    {"}"}
                  </div>
                </div>
              </div>
            </ComponentBox>

            <ComponentBox label="Breadcrumb">
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: tokens.font.size.sm }}>
                <span style={{ color: tokens.color.neutral[500], cursor: "pointer" }}>Home</span>
                <ChevronRight size={14} color={tokens.color.neutral[400]} />
                <span style={{ color: tokens.color.neutral[500], cursor: "pointer" }}>Projetos</span>
                <ChevronRight size={14} color={tokens.color.neutral[400]} />
                <span style={{ color: tokens.color.neutral[800], fontWeight: 500 }}>Editar projeto</span>
              </div>
            </ComponentBox>

            <ComponentBox label="Page Header Pattern">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: tokens.font.size["4xl"], fontWeight: tokens.font.weight.bold, color: tokens.color.neutral[900] }}>
                  Usuários
                </h1>
                <button className="ds-btn-primary" style={{
                  background: tokens.color.teal[600], color: "#FFF", border: "none",
                  padding: "10px 20px", borderRadius: tokens.radius.md, fontSize: tokens.font.size.sm,
                  fontWeight: tokens.font.weight.semibold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                }}>
                  + Criar usuário
                </button>
              </div>
            </ComponentBox>

            <ComponentBox label="Espaçamento — Grid de Referência">
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((s) => (
                  <div key={s} style={{ textAlign: "center" }}>
                    <div style={{
                      width: parseInt(tokens.spacing[s]), height: parseInt(tokens.spacing[s]),
                      background: tokens.color.teal[200], borderRadius: 2, marginBottom: 4,
                      minWidth: 8, minHeight: 8,
                    }} />
                    <div style={{ fontSize: 9, color: tokens.color.neutral[400] }}>{tokens.spacing[s]}</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: tokens.color.neutral[600] }}>{s}</div>
                  </div>
                ))}
              </div>
            </ComponentBox>

            <ComponentBox label="Border Radius">
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {Object.entries(tokens.radius).filter(([k]) => k !== "full").map(([k, v]) => (
                  <div key={k} style={{ textAlign: "center" }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: v,
                      border: `2px solid ${tokens.color.teal[600]}`, background: tokens.color.teal[50],
                      marginBottom: 6,
                    }} />
                    <div style={{ fontSize: 10, fontWeight: 600, color: tokens.color.neutral[600] }}>{k}</div>
                    <div style={{ fontSize: 9, color: tokens.color.neutral[400] }}>{v}</div>
                  </div>
                ))}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: tokens.radius.full,
                    border: `2px solid ${tokens.color.teal[600]}`, background: tokens.color.teal[50],
                    marginBottom: 6,
                  }} />
                  <div style={{ fontSize: 10, fontWeight: 600, color: tokens.color.neutral[600] }}>full</div>
                  <div style={{ fontSize: 9, color: tokens.color.neutral[400] }}>9999px</div>
                </div>
              </div>
            </ComponentBox>
          </Section>
        )}
      </main>
    </div>
  );
}

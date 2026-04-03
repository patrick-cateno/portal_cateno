import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Grid3X3, Star, StarOff, Send, Bot, User, ArrowRight, X, TrendingUp, Shield, CreditCard, FileText, BarChart3, Users, Globe, Zap, Layers, Activity, Building2, Wallet, Receipt, PiggyBank, Landmark, FileCheck, AlertCircle, Sparkles, CornerDownLeft } from "lucide-react";

// ═══════════════════════════════════════════════════════════
//  CATENO BRAND TOKENS — extraídos de cateno.com.br
// ═══════════════════════════════════════════════════════════
const brand = {
  teal600: "#0D9488",     // COR PRINCIPAL — botões, links, toggles, sidebar ativa
  teal700: "#0F766E",     // Hover de botões
  teal500: "#14B8A6",     // Background login, CTA secundário
  teal400: "#2DD4BF",     // Ícones secundários
  teal300: "#5EEAD4",     // Bordas ativas
  teal200: "#99F6E4",     // Hover leve
  teal100: "#CCFBF1",     // Highlight sutil
  teal50:  "#F0FDFA",     // Background de página
  white:   "#FFFFFF",     // Cards, superfícies
  gray50:  "#F8FAFC",     // Background alternativo
  gray100: "#F1F5F9",     // Hover de linhas de tabela
  gray200: "#E2E8F0",     // Bordas, divisores
  gray300: "#CBD5E1",     // Ícones desabilitados
  gray400: "#94A3B8",     // Placeholder text
  gray500: "#64748B",     // Texto secundário
  gray700: "#334155",     // Texto corpo (logo text)
  gray800: "#1E293B",     // Texto principal, headings
  gray900: "#0F172A",     // Texto mais escuro
  lime300: "#BEF264",     // Tags de ferramentas
  success: "#10B981",
  warning: "#F59E0B",
  danger:  "#EF4444",
};

// ─── Application Data ───────────────────────────────────
const categories = ["Todas", "Cartões", "Financeiro", "Operações", "Compliance", "Analytics", "Infraestrutura"];

const apps = [
  { id: 1, name: "Gestão de Cartões", desc: "Emissão, bloqueio e gestão do ciclo de vida dos cartões", icon: CreditCard, category: "Cartões", status: "online", users: 342, trend: "+12%" },
  { id: 2, name: "Fatura Digital", desc: "Geração e consulta de faturas em tempo real", icon: FileText, category: "Cartões", status: "online", users: 1205, trend: "+8%" },
  { id: 3, name: "Processamento de Transações", desc: "Motor de autorização e processamento de transações", icon: Zap, category: "Operações", status: "online", users: 89, trend: "+3%" },
  { id: 4, name: "Conciliação Financeira", desc: "Reconciliação automática de movimentações", icon: BarChart3, category: "Financeiro", status: "online", users: 56, trend: "+5%" },
  { id: 5, name: "Antifraude", desc: "Detecção e prevenção de fraudes com ML", icon: Shield, category: "Compliance", status: "online", users: 23, trend: "+22%" },
  { id: 6, name: "KYC & Onboarding", desc: "Validação de identidade e cadastro de clientes", icon: Users, category: "Compliance", status: "online", users: 178, trend: "+15%" },
  { id: 7, name: "Dashboard Executivo", desc: "Painéis gerenciais com KPIs em tempo real", icon: Activity, category: "Analytics", status: "online", users: 445, trend: "+18%" },
  { id: 8, name: "Gestão de Limites", desc: "Definição e controle de limites de crédito", icon: TrendingUp, category: "Cartões", status: "online", users: 67, trend: "+4%" },
  { id: 9, name: "Portal do Parceiro", desc: "Interface para parceiros e bandeiras", icon: Building2, category: "Operações", status: "maintenance", users: 234, trend: "+7%" },
  { id: 10, name: "Liquidação", desc: "Processamento de liquidação e repasses", icon: Landmark, category: "Financeiro", status: "online", users: 34, trend: "+2%" },
  { id: 11, name: "Cashback & Rewards", desc: "Programa de benefícios e cashback", icon: PiggyBank, category: "Cartões", status: "online", users: 512, trend: "+31%" },
  { id: 12, name: "Compliance & BACEN", desc: "Relatórios regulatórios e conformidade", icon: FileCheck, category: "Compliance", status: "online", users: 19, trend: "+1%" },
  { id: 13, name: "Gestão de Disputas", desc: "Chargebacks e contestações de transações", icon: AlertCircle, category: "Operações", status: "online", users: 78, trend: "+9%" },
  { id: 14, name: "Cobrança", desc: "Régua de cobrança e recuperação de crédito", icon: Wallet, category: "Financeiro", status: "online", users: 45, trend: "+6%" },
  { id: 15, name: "API Gateway", desc: "Gerenciamento e monitoramento de APIs", icon: Globe, category: "Infraestrutura", status: "online", users: 12, trend: "+14%" },
  { id: 16, name: "Observabilidade", desc: "Logs, métricas e traces centralizados", icon: Layers, category: "Infraestrutura", status: "online", users: 28, trend: "+10%" },
  { id: 17, name: "Emissão Instantânea", desc: "Emissão de cartões virtuais em tempo real", icon: Zap, category: "Cartões", status: "online", users: 890, trend: "+45%" },
  { id: 18, name: "Receita & Billing", desc: "Gestão de receitas e tarifação", icon: Receipt, category: "Financeiro", status: "online", users: 33, trend: "+3%" },
];

// ─── AI Conversation Responses ──────────────────────────
const aiResponses = {
  "cartão": { text: "Encontrei 5 aplicações relacionadas a cartões. A mais acessada é **Emissão Instantânea** com 890 usuários ativos. Deseja abrir alguma?", apps: [17, 1, 2, 8, 11] },
  "fatura": { text: "A **Fatura Digital** está online com 1.205 usuários ativos. O volume de consultas subiu 8% este mês. Posso abrir para você?", apps: [2] },
  "fraude": { text: "O sistema **Antifraude** está operando normalmente. Detecções subiram 22% — provavelmente relacionado à nova regra de ML implantada na semana passada. Quer acessar o painel?", apps: [5] },
  "financeiro": { text: "Temos 4 aplicações financeiras ativas: Conciliação, Liquidação, Cobrança e Receita & Billing. Qual área precisa consultar?", apps: [4, 10, 14, 18] },
  "dashboard": { text: "O **Dashboard Executivo** mostra que o volume de transações está 18% acima da média. Abrindo os KPIs para você?", apps: [7] },
  "status": { text: "📊 **Status geral do portal:**\n\n✅ 17 aplicações online\n🔧 1 em manutenção (Portal do Parceiro)\n\nTempo médio de resposta: 145ms\nUptime: 99.97%", apps: [] },
  "ajuda": { text: "Posso te ajudar com:\n\n• **Navegar** — \"abrir gestão de cartões\"\n• **Consultar status** — \"como está o antifraude?\"\n• **Buscar dados** — \"quantos usuários ativos hoje?\"\n• **Executar ações** — \"gerar relatório de conciliação\"\n\nÉ só pedir naturalmente!", apps: [] },
  default: { text: "Entendi sua solicitação. Deixa eu buscar as informações mais relevantes para você...", apps: [] },
};

function getAIResponse(input) {
  const lower = input.toLowerCase();
  for (const [key, value] of Object.entries(aiResponses)) {
    if (key !== "default" && lower.includes(key)) return value;
  }
  if (lower.includes("olá") || lower.includes("oi") || lower.includes("hey")) {
    return { text: "Olá, Patrick! 👋 Bem-vindo ao Portal Cateno. Como posso ajudar hoje? Você pode me pedir para abrir qualquer aplicação, consultar status ou executar ações.", apps: [] };
  }
  if (lower.includes("manutenção") || lower.includes("offline")) {
    return { text: "O **Portal do Parceiro** está em manutenção programada até às 18h. Todas as outras 17 aplicações estão operando normalmente.", apps: [9] };
  }
  if (lower.includes("popular") || lower.includes("mais usad")) {
    return { text: "As 3 aplicações mais acessadas hoje:\n\n1. **Fatura Digital** — 1.205 usuários\n2. **Emissão Instantânea** — 890 usuários\n3. **Cashback & Rewards** — 512 usuários", apps: [2, 17, 11] };
  }
  return aiResponses.default;
}

// ─── Cateno Logo SVG ────────────────────────────────────
function CatenoLogo({ dark }) {
  return (
    <svg viewBox="0 0 140 44" width={120} height={38} fill="none">
      <path d="M18 6 C26 2, 34 2, 42 6 C50 10, 58 10, 66 6 C74 2, 82 2, 90 6" stroke="#D4C73E" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
      <path d="M14 12 C22 8, 30 8, 38 12 C46 16, 54 16, 62 12 C70 8, 78 8, 86 12" stroke="#5BB89C" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
      <path d="M10 18 C18 14, 26 14, 34 18 C42 22, 50 22, 58 18 C66 14, 74 14, 82 18" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
      <text x="10" y="38" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="700" fill={dark ? "#FFFFFF" : "#334155"} letterSpacing="-0.3">cateno</text>
    </svg>
  );
}

// ─── Styles ─────────────────────────────────────────────
const s = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: brand.teal50,
    minHeight: "100vh",
    color: brand.gray800,
  },
  // Header — branco com borda, como o site real
  header: {
    background: brand.white,
    borderBottom: `1px solid ${brand.gray200}`,
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  headerInner: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "12px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewToggle: {
    display: "flex",
    background: brand.gray100,
    borderRadius: 8,
    padding: 3,
    gap: 3,
  },
  viewBtn: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 18px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.2s ease",
    background: active ? brand.teal600 : "transparent",
    color: active ? "#FFFFFF" : brand.gray500,
  }),
  main: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "24px 32px",
  },
  // Toolbar
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: brand.white,
    border: `1px solid ${brand.gray200}`,
    borderRadius: 8,
    padding: "10px 14px",
    flex: 1,
    minWidth: 280,
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 14,
    color: brand.gray800,
    background: "transparent",
    width: "100%",
    fontFamily: "inherit",
  },
  chip: (active) => ({
    padding: "7px 16px",
    borderRadius: 8,
    border: active ? "none" : `1px solid ${brand.gray200}`,
    background: active ? brand.teal600 : brand.white,
    color: active ? "#FFFFFF" : brand.gray500,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
  },
  // Cards — brancos com borda sutil, como o design real
  card: (hov) => ({
    background: brand.white,
    borderRadius: 16,
    padding: 24,
    border: `1px solid ${hov ? brand.teal300 : brand.gray200}`,
    cursor: "pointer",
    transition: "all 0.25s ease",
    transform: hov ? "translateY(-3px)" : "none",
    boxShadow: hov ? "0 10px 30px rgba(13, 148, 136, 0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
    position: "relative",
    overflow: "hidden",
  }),
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: brand.teal50,
    border: `1px solid ${brand.teal100}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statusDot: (st) => ({
    width: 7, height: 7, borderRadius: "50%",
    background: st === "online" ? brand.success : brand.warning,
    boxShadow: `0 0 6px ${st === "online" ? brand.success : brand.warning}`,
  }),
  // AI View
  aiContainer: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 68px)",
    maxWidth: 900,
    margin: "0 auto",
  },
  msgBubble: (isUser) => ({
    maxWidth: "75%",
    padding: "14px 18px",
    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background: isUser ? brand.teal600 : brand.white,
    color: isUser ? "#FFFFFF" : brand.gray800,
    fontSize: 14,
    lineHeight: 1.7,
    alignSelf: isUser ? "flex-end" : "flex-start",
    boxShadow: isUser ? "0 4px 12px rgba(13, 148, 136, 0.25)" : `0 1px 4px rgba(0,0,0,0.06)`,
    border: isUser ? "none" : `1px solid ${brand.gray200}`,
    whiteSpace: "pre-wrap",
  }),
  appChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    borderRadius: 8,
    background: brand.teal50,
    border: `1px solid ${brand.teal200}`,
    color: brand.teal700,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  sendBtn: (has) => ({
    width: 40,
    height: 40,
    borderRadius: 8,
    border: "none",
    background: has ? brand.teal600 : brand.gray200,
    color: has ? "#FFFFFF" : brand.gray400,
    cursor: has ? "pointer" : "default",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    flexShrink: 0,
  }),
};

// ─── Card Component ─────────────────────────────────────
function AppCard({ app, isFav, onToggleFav }) {
  const [hov, setHov] = useState(false);
  const Icon = app.icon;
  return (
    <div style={s.card(hov)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${brand.teal600}, ${brand.teal400})`, borderRadius: "16px 16px 0 0" }} />}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={s.cardIcon}>
            <Icon size={20} color={brand.teal600} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 650, color: brand.gray800, marginBottom: 5 }}>{app.name}</div>
            <div style={{ fontSize: 13, color: brand.gray500, lineHeight: 1.5 }}>{app.desc}</div>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleFav(app.id); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: brand.gray400 }}>
          {isFav ? <Star size={17} fill="#F59E0B" color="#F59E0B" /> : <StarOff size={17} />}
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${brand.gray200}`, paddingTop: 12 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: app.status === "online" ? brand.success : brand.warning }}>
          <span style={s.statusDot(app.status)} />
          {app.status === "online" ? "Online" : "Manutenção"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: brand.gray500, display: "flex", alignItems: "center", gap: 4 }}>
            <Users size={13} /> {app.users}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: brand.success, background: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: 6 }}>{app.trend}</span>
        </div>
      </div>
      {hov && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 24px", background: `linear-gradient(transparent, ${brand.teal50})`, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, fontSize: 13, fontWeight: 600, color: brand.teal600 }}>
          Abrir <ArrowRight size={14} />
        </div>
      )}
    </div>
  );
}

// ─── Main Portal ────────────────────────────────────────
export default function CatenoPortal() {
  const [view, setView] = useState("cards");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [favorites, setFavorites] = useState([1, 5, 7, 17]);
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const toggleFav = (id) => setFavorites((p) => p.includes(id) ? p.filter((f) => f !== id) : [...p, id]);

  const filteredApps = apps.filter((a) => {
    const matchS = a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
    const matchC = category === "Todas" || a.category === category;
    const matchF = !showFavsOnly || favorites.includes(a.id);
    return matchS && matchC && matchF;
  });

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    setMessages((p) => [...p, { role: "user", content: text, time: new Date() }]);
    setInputText("");
    setIsTyping(true);
    setTimeout(() => {
      const r = getAIResponse(text);
      setIsTyping(false);
      setMessages((p) => [...p, { role: "ai", content: r.text, apps: r.apps, time: new Date() }]);
    }, 800 + Math.random() * 700);
  }, []);

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputText); } };

  const quickActions = [
    { label: "Status das aplicações", icon: Activity },
    { label: "Mais populares", icon: TrendingUp },
    { label: "Abrir Antifraude", icon: Shield },
    { label: "Ajuda", icon: Sparkles },
  ];

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${brand.gray300}; border-radius: 3px; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .hover-teal:hover { border-color: ${brand.teal300} !important; color: ${brand.teal600} !important; }
        .hover-lift:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(13,148,136,0.1) !important; }
        .chip-hover:hover { background: ${brand.teal50} !important; border-color: ${brand.teal300} !important; }
        .send-hover:hover { transform: scale(1.04); }
      `}</style>

      {/* ─── Header ─── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <CatenoLogo />
          <div style={s.viewToggle}>
            <button style={s.viewBtn(view === "cards")} onClick={() => setView("cards")}>
              <Grid3X3 size={15} /> Aplicações
            </button>
            <button style={s.viewBtn(view === "ai")} onClick={() => setView("ai")}>
              <Sparkles size={15} /> CatIA
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: brand.gray500, fontSize: 13 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: brand.teal600,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13, color: "#FFFFFF",
            }}>PI</div>
            <span style={{ fontWeight: 500, color: brand.gray700 }}>Patrick Iarrocheski</span>
          </div>
        </div>
      </header>

      {/* ─── Cards View ─── */}
      {view === "cards" && (
        <main style={s.main} className="fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={s.searchBox}>
              <Search size={17} color={brand.gray400} />
              <input style={s.searchInput} placeholder="Buscar aplicações..." value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setSearch("")}><X size={15} color={brand.gray400} /></button>}
            </div>
            <button className="hover-teal" onClick={() => setShowFavsOnly(!showFavsOnly)} style={{
              ...s.chip(showFavsOnly),
              display: "flex", alignItems: "center", gap: 5,
              background: showFavsOnly ? "#F59E0B" : brand.white,
              color: showFavsOnly ? "#FFF" : brand.gray500,
              border: showFavsOnly ? "none" : `1px solid ${brand.gray200}`,
            }}>
              <Star size={13} fill={showFavsOnly ? "#FFF" : "none"} /> Favoritos
            </button>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
            {categories.map((cat) => (
              <button key={cat} className="chip-hover" style={s.chip(category === cat)} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>

          <div style={{ fontSize: 13, color: brand.gray500, marginBottom: 14 }}>
            {filteredApps.length} aplicação{filteredApps.length !== 1 ? "ões" : ""} encontrada{filteredApps.length !== 1 ? "s" : ""}
          </div>

          <div style={s.grid}>
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} isFav={favorites.includes(app.id)} onToggleFav={toggleFav} />
            ))}
          </div>
        </main>
      )}

      {/* ─── AI View ─── */}
      {view === "ai" && (
        <div style={s.aiContainer} className="fade-in">
          {messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "56px 20px 36px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, margin: "0 auto 18px",
                background: `linear-gradient(135deg, ${brand.teal600}, ${brand.teal400})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 24px rgba(13, 148, 136, 0.2)",
              }}>
                <Sparkles size={28} color="#FFFFFF" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: brand.gray800, marginBottom: 6 }}>CatIA</div>
              <div style={{ fontSize: 15, color: brand.gray500, marginBottom: 36, lineHeight: 1.6 }}>
                Seu assistente inteligente para navegar o portal.<br />
                Peça qualquer coisa em linguagem natural.
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {quickActions.map(({ label, icon: QI }) => (
                  <button key={label} className="hover-lift chip-hover" onClick={() => sendMessage(label.toLowerCase())} style={{
                    padding: "10px 20px", borderRadius: 20,
                    border: `1px solid ${brand.gray200}`, background: brand.white,
                    color: brand.gray800, fontSize: 13, fontWeight: 500,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                    transition: "all 0.2s ease",
                  }}>
                    <QI size={15} color={brand.teal600} /> {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column" }} className="fade-in">
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: brand.gray400, marginBottom: 5, alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "user" ? <User size={11} /> : <Bot size={11} />}
                  {msg.role === "user" ? "Você" : "CatIA"}
                  <span style={{ marginLeft: 4 }}>{msg.time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div style={s.msgBubble(msg.role === "user")}>
                  {msg.content.split("\n").map((line, j) => (
                    <span key={j}>
                      {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                        part.startsWith("**") && part.endsWith("**") ? <strong key={k}>{part.slice(2, -2)}</strong> : part
                      )}
                      {j < msg.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                  {msg.apps?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                      {msg.apps.map((appId) => {
                        const app = apps.find((a) => a.id === appId);
                        if (!app) return null;
                        const Icon = app.icon;
                        return (
                          <button key={appId} className="chip-hover" style={s.appChip} onClick={() => { setView("cards"); setSearch(app.name); }}>
                            <Icon size={12} /> {app.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "14px 18px", alignSelf: "flex-start" }} className="fade-in">
                {[0, 0.2, 0.4].map((d) => (
                  <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: brand.teal500, animation: `bounce 1.4s ease-in-out ${d}s infinite`, opacity: 0.6 }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: "16px 20px", borderTop: `1px solid ${brand.gray200}`, background: brand.white, borderRadius: "16px 16px 0 0", boxShadow: "0 -2px 12px rgba(0,0,0,0.03)" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: brand.teal50, borderRadius: 12,
              padding: "5px 6px 5px 16px",
              border: `1px solid ${brand.gray200}`,
              transition: "all 0.2s ease",
            }}>
              <Sparkles size={16} color={brand.teal600} />
              <input
                style={{ border: "none", outline: "none", fontSize: 14, color: brand.gray800, background: "transparent", width: "100%", fontFamily: "inherit", padding: "8px 0" }}
                placeholder="Pergunte qualquer coisa ao CatIA..."
                value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKey}
              />
              <button className="send-hover" style={s.sendBtn(inputText.trim().length > 0)} onClick={() => sendMessage(inputText)} disabled={!inputText.trim()}>
                <Send size={16} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 8, fontSize: 11, color: brand.gray400 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 5px", borderRadius: 4, background: brand.gray50, border: `1px solid ${brand.gray200}`, fontSize: 10, fontWeight: 600 }}>
                <CornerDownLeft size={9} /> Enter
              </span>
              para enviar
              <span>•</span>
              Experimente: "abrir fatura digital" ou "status das aplicações"
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AgentGraphSVG() {
  const nodes = [
    { cx: 230, cy: 46,  rp: 'rp',  np: 'np',  label: 'Agent:Top', tx: 230, ty: 72  },
    { cx: 362, cy: 78,  rp: 'rp2', np: 'np2', label: 'Agent:TR',  tx: 362, ty: 104 },
    { cx: 406, cy: 197, rp: 'rp3', np: 'np3', label: 'Agent:R',   tx: 406, ty: 223 },
    { cx: 362, cy: 330, rp: 'rp4', np: 'np4', label: 'Agent:BR',  tx: 362, ty: 356 },
    { cx: 230, cy: 362, rp: 'rp5', np: 'np5', label: 'Agent:Bot', tx: 230, ty: 388 },
    { cx: 98,  cy: 330, rp: 'rp6', np: 'np6', label: 'Agent:BL',  tx: 98,  ty: 356 },
    { cx: 54,  cy: 197, rp: 'rp7', np: 'np7', label: 'Agent:L',   tx: 54,  ty: 223 },
    { cx: 98,  cy: 78,  rp: 'rp8', np: 'np8', label: 'Agent:TL',  tx: 98,  ty: 104 },
  ];

  return (
    <div
      className="animate-fade-in-up delay-400"
      style={{
        flex: '1 1 0',
        minWidth: 0,
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(79,110,247,0.2)',
        boxShadow: '0 0 0 1px rgba(34,211,165,0.08), 0 24px 80px rgba(0,0,0,0.6), 0 0 80px rgba(59,108,255,0.12)',
        background: '#050810',
      }}
    >
      <svg width="100%" viewBox="0 0 460 480" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>{`
            .gear-spin { animation: sg 12s linear infinite; transform-origin:230px 200px; }
            @keyframes sg { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            .shield-outer { animation: sho 3s ease-in-out infinite; transform-origin:230px 200px; }
            @keyframes sho { 0%,100%{opacity:0.18;transform:scale(1);} 50%{opacity:0.35;transform:scale(1.03);} }
            .shield-mid { animation: shm 3s ease-in-out infinite 0.5s; transform-origin:230px 200px; }
            @keyframes shm { 0%,100%{opacity:0.12;} 50%{opacity:0.28;} }
            .hex-spin { animation: hs 20s linear infinite reverse; transform-origin:230px 200px; }
            @keyframes hs { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            .lf  { stroke-dasharray:5,4; animation: fd 1.6s linear infinite; }
            .lf2 { stroke-dasharray:5,4; animation: fd 1.6s linear infinite 0.2s; }
            .lf3 { stroke-dasharray:5,4; animation: fd 1.6s linear infinite 0.4s; }
            .lf4 { stroke-dasharray:5,4; animation: fd 1.6s linear infinite 0.6s; }
            .lf5 { stroke-dasharray:5,4; animation: fd 1.6s linear infinite 0.8s; }
            .lf6 { stroke-dasharray:5,4; animation: fd 1.6s linear infinite 1.0s; }
            .lf7 { stroke-dasharray:5,4; animation: fd 1.6s linear infinite 1.2s; }
            .lf8 { stroke-dasharray:5,4; animation: fd 1.6s linear infinite 1.4s; }
            @keyframes fd { to{ stroke-dashoffset:-18; } }
            .travel  { animation: tr 1.6s linear infinite; }
            .travel2 { animation: tr 1.6s linear infinite 0.2s; }
            .travel3 { animation: tr 1.6s linear infinite 0.4s; }
            .travel4 { animation: tr 1.6s linear infinite 0.6s; }
            .travel5 { animation: tr 1.6s linear infinite 0.8s; }
            .travel6 { animation: tr 1.6s linear infinite 1.0s; }
            .travel7 { animation: tr 1.6s linear infinite 1.2s; }
            .travel8 { animation: tr 1.6s linear infinite 1.4s; }
            @keyframes tr { 0%{opacity:0;} 8%{opacity:1;} 92%{opacity:1;} 100%{opacity:0;} }
            .np  { animation: np 2.2s ease-in-out infinite; }
            .np2 { animation: np 2.2s ease-in-out infinite 0.28s; }
            .np3 { animation: np 2.2s ease-in-out infinite 0.55s; }
            .np4 { animation: np 2.2s ease-in-out infinite 0.83s; }
            .np5 { animation: np 2.2s ease-in-out infinite 1.1s; }
            .np6 { animation: np 2.2s ease-in-out infinite 1.38s; }
            .np7 { animation: np 2.2s ease-in-out infinite 1.65s; }
            .np8 { animation: np 2.2s ease-in-out infinite 1.93s; }
            @keyframes np { 0%,100%{opacity:0.75;} 50%{opacity:1;} }
            .rp  { animation: rp 2.2s ease-out infinite; }
            .rp2 { animation: rp 2.2s ease-out infinite 0.28s; }
            .rp3 { animation: rp 2.2s ease-out infinite 0.55s; }
            .rp4 { animation: rp 2.2s ease-out infinite 0.83s; }
            .rp5 { animation: rp 2.2s ease-out infinite 1.1s; }
            .rp6 { animation: rp 2.2s ease-out infinite 1.38s; }
            .rp7 { animation: rp 2.2s ease-out infinite 1.65s; }
            .rp8 { animation: rp 2.2s ease-out infinite 1.93s; }
            @keyframes rp { 0%{r:14;opacity:0.4;} 100%{r:30;opacity:0;} }
            .human-bob { animation: hb 3s ease-in-out infinite; transform-origin:230px 195px; }
            @keyframes hb { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
            .lock-pulse { animation: lp 1.5s ease-in-out infinite; }
            @keyframes lp { 0%,100%{opacity:0.8;} 50%{opacity:1;} }
            .scan-line { animation: sl 3s linear infinite; }
            @keyframes sl { 0%{transform:translateY(-40px);opacity:0;} 10%{opacity:0.6;} 90%{opacity:0.6;} 100%{transform:translateY(40px);opacity:0;} }
            .node-label { font-size:8px; font-weight:600; fill:#a5b4fc; letter-spacing:0.5px; font-family:-apple-system,sans-serif; }
            .edge-label { font-size:7px; fill:#4f6ef7; font-family:-apple-system,sans-serif; opacity:0.8; }
          `}</style>
        </defs>

        {/* background grid */}
        {[40,80,120,160,200,240,280,320,360].map(y => <line key={`h${y}`} x1="0" y1={y} x2="460" y2={y} stroke="#0f1729" strokeWidth="0.5"/>)}
        {[40,80,120,160,200,240,280,320,360,400].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="420" stroke="#0f1729" strokeWidth="0.5"/>)}

        {/* shield rings */}
        <circle className="shield-outer" cx="230" cy="200" r="148" fill="none" stroke="#22d3a5" strokeWidth="1.2" strokeDasharray="8,6"/>
        <circle className="shield-mid"   cx="230" cy="200" r="118" fill="none" stroke="#4f6ef7" strokeWidth="0.8" strokeDasharray="5,8"/>

        {/* hex perimeter */}
        <g className="hex-spin">
          <polygon points="230,52 262,70 262,106 230,124 198,106 198,70" fill="none" stroke="#1e3a5f" strokeWidth="1" opacity="0.5"/>
          <polygon points="230,276 262,294 262,330 230,348 198,330 198,294" fill="none" stroke="#1e3a5f" strokeWidth="1" opacity="0.5"/>
        </g>

        {/* gear */}
        <g className="gear-spin">
          <path d="M230 153 L238 143 L246 150 L242 160 Q253 166 258 175 L270 173 L273 182 L263 188 Q264 199 261 209 L271 215 L269 225 L258 222 Q252 231 244 236 L245 247 L236 250 L231 240 Q220 241 212 237 L208 247 L199 244 L200 234 Q191 228 188 219 L177 221 L174 212 L184 207 Q183 196 186 186 L176 180 L179 171 L190 173 Q195 164 204 159 L200 149 L208 142 L215 152 Q222 149 230 153Z" fill="none" stroke="#3b5bdb" strokeWidth="2" strokeLinejoin="round" opacity="0.9"/>
          <circle cx="230" cy="197" r="32" fill="#0a0f1e" stroke="#3b5bdb" strokeWidth="1.8"/>
          <circle cx="230" cy="197" r="22" fill="none" stroke="#1e3a8a" strokeWidth="0.8" opacity="0.5"/>
        </g>
        <line x1="198" y1="197" x2="262" y2="197" stroke="#22d3a5" strokeWidth="1" opacity="0.4" className="scan-line"/>

        {/* human center */}
        <g className="human-bob">
          <circle cx="230" cy="183" r="11" fill="#0d1b35" stroke="#22d3a5" strokeWidth="2" className="lock-pulse"/>
          <circle cx="226" cy="181" r="1.8" fill="#22d3a5"/>
          <circle cx="234" cy="181" r="1.8" fill="#22d3a5"/>
          <path d="M226 187 Q230 190 234 187" fill="none" stroke="#22d3a5" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M218 210 Q218 197 230 195 Q242 197 242 210" fill="#0d1b35" stroke="#22d3a5" strokeWidth="1.8"/>
          <rect x="225" y="201" width="10" height="8" rx="2" fill="none" stroke="#4f6ef7" strokeWidth="1.5" className="lock-pulse"/>
          <path d="M227 201 L227 197 Q227 194 230 194 Q233 194 233 197 L233 201" fill="none" stroke="#4f6ef7" strokeWidth="1.5"/>
          <circle cx="230" cy="205" r="1.8" fill="#4f6ef7"/>
          <rect x="214" y="213" width="32" height="9" rx="4" fill="#22d3a5" opacity="0.15" stroke="#22d3a5" strokeWidth="0.8"/>
          <text x="230" y="220" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#22d3a5" fontFamily="-apple-system,sans-serif" letterSpacing="0.5">AUTHORIZED</text>
        </g>

        {/* edges */}
        <line x1="230" y1="165" x2="230" y2="62"  stroke="#4f6ef7" strokeWidth="1.5" className="lf"  opacity="0.7"/>
        <text x="236" y="112" className="edge-label">:AUTHORIZES</text>
        <circle className="travel"  cx="230" cy="120" r="3.5" fill="#4f6ef7"/>

        <line x1="248" y1="172" x2="348" y2="90"  stroke="#4f6ef7" strokeWidth="1.5" className="lf2" opacity="0.7"/>
        <text x="302" y="124" className="edge-label">:GATES</text>
        <circle className="travel2" cx="300" cy="130" r="3.5" fill="#4f6ef7"/>

        <line x1="262" y1="197" x2="388" y2="197" stroke="#4f6ef7" strokeWidth="1.5" className="lf3" opacity="0.7"/>
        <text x="312" y="192" className="edge-label">:VALIDATES</text>
        <circle className="travel3" cx="320" cy="197" r="3.5" fill="#4f6ef7"/>

        <line x1="248" y1="222" x2="348" y2="318" stroke="#4f6ef7" strokeWidth="1.5" className="lf4" opacity="0.7"/>
        <text x="302" y="278" className="edge-label">:MONITORS</text>
        <circle className="travel4" cx="298" cy="270" r="3.5" fill="#4f6ef7"/>

        <line x1="230" y1="230" x2="230" y2="348" stroke="#4f6ef7" strokeWidth="1.5" className="lf5" opacity="0.7"/>
        <text x="236" y="292" className="edge-label">:AUDITS</text>
        <circle className="travel5" cx="230" cy="288" r="3.5" fill="#4f6ef7"/>

        <line x1="212" y1="222" x2="112" y2="318" stroke="#4f6ef7" strokeWidth="1.5" className="lf6" opacity="0.7"/>
        <text x="138" y="278" className="edge-label">:REVOKES</text>
        <circle className="travel6" cx="162" cy="270" r="3.5" fill="#4f6ef7"/>

        <line x1="198" y1="197" x2="72"  y2="197" stroke="#4f6ef7" strokeWidth="1.5" className="lf7" opacity="0.7"/>
        <text x="108" y="192" className="edge-label">:CONSENTS</text>
        <circle className="travel7" cx="138" cy="197" r="3.5" fill="#4f6ef7"/>

        <line x1="212" y1="172" x2="112" y2="90"  stroke="#4f6ef7" strokeWidth="1.5" className="lf8" opacity="0.7"/>
        <text x="140" y="124" className="edge-label">:TOKENS</text>
        <circle className="travel8" cx="162" cy="130" r="3.5" fill="#4f6ef7"/>

        {/* agent nodes */}
        {nodes.map(n => (
          <g key={n.label}>
            <circle className={n.rp} cx={n.cx} cy={n.cy} r="14" fill="none" stroke="#22d3a5" strokeWidth="1" opacity="0"/>
            <circle className={n.np} cx={n.cx} cy={n.cy} r="20" fill="#0a1628" stroke="#4f6ef7" strokeWidth="2"/>
            <circle cx={n.cx} cy={n.cy} r="13" fill="#0d1f3c" stroke="#22d3a5" strokeWidth="1.2"/>
            <rect x={n.cx-7} y={n.cy-7} width="14" height="11" rx="3" fill="none" stroke="#22d3a5" strokeWidth="1.4"/>
            <line x1={n.cx} y1={n.cy-7} x2={n.cx} y2={n.cy-11} stroke="#22d3a5" strokeWidth="1.2"/>
            <circle cx={n.cx} cy={n.cy-12} r="2.2" fill="#22d3a5"/>
            <text x={n.tx} y={n.ty} textAnchor="middle" className="node-label">{n.label}</text>
          </g>
        ))}

        {/* wordmark */}
        <text x="230" y="418" textAnchor="middle" fontFamily="-apple-system,sans-serif" fontSize="24" fontWeight="700" fill="#ffffff" letterSpacing="-0.5">AgentGate</text>
        <text x="230" y="436" textAnchor="middle" fontFamily="-apple-system,sans-serif" fontSize="9" fill="#22d3a5" letterSpacing="3">AI AUTHORIZATION MIDDLEWARE</text>
      </svg>
    </div>
  );
}

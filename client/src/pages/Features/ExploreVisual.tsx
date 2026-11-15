function ExploreVisual() {
  return (
    <div
      aria-hidden="true"
      className="explore-visual relative mx-auto aspect-square w-full max-w-[520px]"
    >
      <div className="absolute inset-[12%] rounded-full bg-cyan-400/10 blur-3xl" />
      <svg viewBox="0 0 520 520" className="relative h-full w-full overflow-visible">
        <defs>
          <radialGradient id="explore-globe" cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="#0e7490" stopOpacity="0.22" />
            <stop offset="1" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="explore-building" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#164e63" stopOpacity="0.8" />
            <stop offset="1" stopColor="#0f172a" stopOpacity="0.18" />
          </linearGradient>
          <filter id="explore-soft-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <circle cx="260" cy="260" r="218" fill="url(#explore-globe)" />
        <g className="explore-visual-orbit" fill="none" stroke="#67e8f9" strokeOpacity="0.2">
          <ellipse cx="260" cy="260" rx="207" ry="94" transform="rotate(-28 260 260)" />
          <ellipse cx="260" cy="260" rx="207" ry="94" transform="rotate(32 260 260)" />
        </g>
        <circle cx="260" cy="260" r="156" fill="none" stroke="#38bdf8" strokeOpacity="0.14" strokeDasharray="2 10" />

        <g fill="url(#explore-building)" stroke="#67e8f9" strokeOpacity="0.25">
          <path d="M76 416V300h42v116zm51 0V267h50v149zm59 0V322h38v94zm49 0V244h54v172zm64 0V292h40v124zm50 0V260h53v156zm62 0V316h38v100z" />
        </g>
        <g fill="#a5f3fc" fillOpacity="0.42">
          <path d="M88 317h8v8h-8zm18 0h8v8h-8zm57-35h9v9h-9zm0 21h9v9h-9zm31 30h8v8h-8zm75-68h9v9h-9zm20 0h9v9h-9zm-29 21h9v9h-9zm63 19h8v8h-8zm21-31h9v9h-9zm20 0h9v9h-9zm31 53h8v8h-8z" />
        </g>

        <path className="explore-visual-route" d="M104 260c53-73 107-70 155 0s100 72 157 0" fill="none" stroke="#22d3ee" strokeOpacity="0.75" strokeWidth="2" />
        <path d="M116 377c48-35 91-35 131 0s84 35 127 0" fill="none" stroke="#818cf8" strokeOpacity="0.38" strokeWidth="2" />

        <g className="explore-visual-pulse">
          <circle cx="104" cy="260" r="14" fill="#22d3ee" fillOpacity="0.13" />
          <circle cx="104" cy="260" r="5" fill="#a5f3fc" />
        </g>
        <g className="explore-visual-pulse explore-visual-pulse-delay">
          <circle cx="416" cy="260" r="14" fill="#818cf8" fillOpacity="0.16" />
          <circle cx="416" cy="260" r="5" fill="#c4b5fd" />
        </g>
        <circle cx="237" cy="188" r="4" fill="#67e8f9" className="explore-visual-signal" />
        <circle cx="337" cy="338" r="4" fill="#a5b4fc" className="explore-visual-signal explore-visual-signal-delay" />

        <ellipse cx="260" cy="419" rx="144" ry="18" fill="#22d3ee" fillOpacity="0.14" filter="url(#explore-soft-glow)" />
        <path d="M260 117c-35 0-63 28-63 63 0 48 63 111 63 111s63-63 63-111c0-35-28-63-63-63Z" fill="#0891b2" fillOpacity="0.2" stroke="#67e8f9" strokeWidth="2" />
        <circle cx="260" cy="180" r="23" fill="#0e7490" stroke="#a5f3fc" strokeWidth="2" />
        <circle cx="260" cy="180" r="8" fill="#cffafe" />

        <path d="M57 418h406" stroke="#67e8f9" strokeOpacity="0.25" />
      </svg>
    </div>
  );
}

export default ExploreVisual;

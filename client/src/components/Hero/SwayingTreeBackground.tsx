function SwayingTreeBackground() {
  return (
    <div className="tree-background" aria-hidden="true">
      <video
        className="tree-background__video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg-hero-0BnFGdr81Ifnj3WbBZoNt1KE4D5DMT.mp4"
          type="video/mp4"
        />
      </video>
      <div className="tree-background__shade" />
      <svg className="tree-background__network" viewBox="0 0 600 220" fill="none">
        <path d="M-20 184 74 145l67 34 79-73 73 32 73-79 84 38 78-69 91 31" />
        <path d="m20 231 94-65 73 26 90-83 67 54 94-98 73 43 81-61" />
        <path d="m85 145 29 21m106-60 34 3m73-82 13 57m84-19 21 21m78-90 15 35" />
        <circle className="tree-background__node tree-background__node-one" cx="74" cy="145" r="5" />
        <circle className="tree-background__node tree-background__node-two" cx="220" cy="106" r="5" />
        <circle className="tree-background__node tree-background__node-three" cx="366" cy="59" r="5" />
        <circle className="tree-background__node tree-background__node-four" cx="450" cy="97" r="5" />
        <circle className="tree-background__node tree-background__node-five" cx="528" cy="28" r="5" />
      </svg>
    </div>
  );
}

export default SwayingTreeBackground;

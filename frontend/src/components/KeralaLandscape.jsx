export function KeralaLandscape({ variant = 'light', className = '' }) {
  const isDark = variant === 'dark';

  return (
    <svg
      className={`kerala-landscape-svg ${className}`}
      viewBox="0 0 700 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id={`sky-grad-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#053424' : '#eaf4ee'} stopOpacity={isDark ? '0.85' : '0.6'} />
          <stop offset="60%" stopColor={isDark ? '#084832' : '#f7fbf8'} stopOpacity={isDark ? '0.9' : '0.8'} />
          <stop offset="100%" stopColor={isDark ? '#0b563c' : '#fff9ef'} stopOpacity="1" />
        </linearGradient>

        {/* Water gradient */}
        <linearGradient id={`water-grad-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#0d4a34' : '#c9dfcf'} stopOpacity="0.8" />
          <stop offset="50%" stopColor={isDark ? '#0a3d2b' : '#b7d5bf'} stopOpacity="0.9" />
          <stop offset="100%" stopColor={isDark ? '#062d1f' : '#a9cbaf'} stopOpacity="0.95" />
        </linearGradient>

        {/* Distant Hills / Forest gradient */}
        <linearGradient id={`hills-grad-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#145c40' : '#8ab896'} stopOpacity="0.6" />
          <stop offset="100%" stopColor={isDark ? '#0c4731' : '#5f9970'} stopOpacity="0.8" />
        </linearGradient>

        {/* Houseboat thatch canopy */}
        <linearGradient id={`thatch-grad-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#7a5a2e' : '#d8a760'} />
          <stop offset="50%" stopColor={isDark ? '#593f1c' : '#b2813c'} />
          <stop offset="100%" stopColor={isDark ? '#3d2a12' : '#7d5523'} />
        </linearGradient>

        {/* Palm tree green */}
        <linearGradient id={`palm-grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#2ea876' : '#2b7853'} />
          <stop offset="100%" stopColor={isDark ? '#146845' : '#1b5437'} />
        </linearGradient>
      </defs>

      {/* Sky background */}
      <rect width="700" height="400" fill={`url(#sky-grad-${variant})`} />

      {/* Distant misty hills & trees */}
      <path
        d="M200 230 C 260 215, 330 220, 390 205 C 450 190, 520 200, 580 185 C 630 175, 680 190, 700 195 L 700 260 L 200 260 Z"
        fill={`url(#hills-grad-${variant})`}
        opacity={isDark ? 0.45 : 0.4}
      />
      <path
        d="M280 240 C 350 225, 420 230, 480 218 C 550 205, 620 210, 700 200 L 700 265 L 280 265 Z"
        fill={`url(#hills-grad-${variant})`}
        opacity={isDark ? 0.6 : 0.65}
      />

      {/* Shoreline with dense coconut palms (right side) */}
      <g id="palm-groves" opacity={isDark ? 0.75 : 0.85}>
        {/* Palm cluster 1 (mid distance) */}
        <path d="M520 250 Q 525 180 530 130" stroke={isDark ? '#285842' : '#655038'} strokeWidth="4" fill="none" />
        {/* Fronds */}
        <path d="M530 130 Q 500 110 470 120" stroke={isDark ? '#368962' : '#2d7852'} strokeWidth="3" fill="none" />
        <path d="M530 130 Q 510 90 490 95" stroke={isDark ? '#368962' : '#2d7852'} strokeWidth="3" fill="none" />
        <path d="M530 130 Q 535 80 545 85" stroke={isDark ? '#368962' : '#2d7852'} strokeWidth="3" fill="none" />
        <path d="M530 130 Q 560 95 570 110" stroke={isDark ? '#368962' : '#2d7852'} strokeWidth="3" fill="none" />
        <path d="M530 130 Q 565 125 580 145" stroke={isDark ? '#368962' : '#2d7852'} strokeWidth="3" fill="none" />

        {/* Palm 2 (prominent) */}
        <path d="M580 250 Q 590 160 610 90" stroke={isDark ? '#234a36' : '#5c4832'} strokeWidth="5" fill="none" />
        <path d="M610 90 Q 560 70 540 85" stroke={`url(#palm-grad-${variant})`} strokeWidth="4" fill="none" />
        <path d="M610 90 Q 580 50 560 55" stroke={`url(#palm-grad-${variant})`} strokeWidth="4" fill="none" />
        <path d="M610 90 Q 615 40 625 45" stroke={`url(#palm-grad-${variant})`} strokeWidth="4" fill="none" />
        <path d="M610 90 Q 645 55 665 70" stroke={`url(#palm-grad-${variant})`} strokeWidth="4" fill="none" />
        <path d="M610 90 Q 655 85 675 110" stroke={`url(#palm-grad-${variant})`} strokeWidth="4" fill="none" />
        <path d="M610 90 Q 630 110 635 130" stroke={`url(#palm-grad-${variant})`} strokeWidth="3" fill="none" />

        {/* Palm 3 (near edge) */}
        <path d="M640 250 Q 655 170 670 110" stroke={isDark ? '#234a36' : '#5c4832'} strokeWidth="5.5" fill="none" />
        <path d="M670 110 Q 630 85 610 100" stroke={`url(#palm-grad-${variant})`} strokeWidth="4" fill="none" />
        <path d="M670 110 Q 650 65 635 70" stroke={`url(#palm-grad-${variant})`} strokeWidth="4" fill="none" />
        <path d="M670 110 Q 685 60 700 68" stroke={`url(#palm-grad-${variant})`} strokeWidth="4" fill="none" />
      </g>

      {/* Water body */}
      <path
        d="M150 255 L 700 255 L 700 400 L 150 400 Z"
        fill={`url(#water-grad-${variant})`}
      />

      {/* Water ripple highlights */}
      <g stroke={isDark ? '#266e4e' : '#e4f1e7'} strokeWidth="1.5" opacity="0.6">
        <line x1="220" y1="270" x2="310" y2="270" />
        <line x1="380" y1="275" x2="520" y2="275" />
        <line x1="180" y1="290" x2="300" y2="290" />
        <line x1="340" y1="300" x2="490" y2="300" />
        <line x1="530" y1="310" x2="650" y2="310" />
        <line x1="250" y1="330" x2="420" y2="330" />
        <line x1="470" y1="345" x2="610" y2="345" />
      </g>

      {/* Houseboat reflection */}
      <ellipse
        cx="530"
        cy="312"
        rx="65"
        ry="8"
        fill={isDark ? '#041f15' : '#73967d'}
        opacity={isDark ? 0.6 : 0.45}
      />

      {/* Traditional Kerala Kettuvallam Houseboat */}
      <g id="kerala-houseboat" transform="translate(450, 248)">
        {/* Curved wooden hull */}
        <path
          d="M10 40 C 25 45, 60 48, 95 48 C 130 48, 155 45, 170 38 C 160 46, 125 54, 90 54 C 55 54, 20 47, 10 40 Z"
          fill={isDark ? '#201509' : '#3d250f'}
        />
        {/* Hull base outline */}
        <path
          d="M8 38 Q 90 60 172 36"
          stroke={isDark ? '#3d2812' : '#573718'}
          strokeWidth="3"
          fill="none"
        />

        {/* Thatched canopy / arched roof */}
        <path
          d="M32 38 C 34 16, 50 10, 85 10 C 120 10, 138 16, 142 38 Z"
          fill={`url(#thatch-grad-${variant})`}
        />
        {/* Thatch roof rib arches */}
        <path d="M45 38 C 46 20, 55 14, 85 14" stroke={isDark ? '#3a250f' : '#6b461b'} strokeWidth="1.5" fill="none" />
        <path d="M65 38 C 66 18, 72 12, 85 12" stroke={isDark ? '#3a250f' : '#6b461b'} strokeWidth="1.5" fill="none" />
        <path d="M105 38 C 104 18, 98 12, 85 12" stroke={isDark ? '#3a250f' : '#6b461b'} strokeWidth="1.5" fill="none" />
        <path d="M125 38 C 124 20, 115 14, 85 14" stroke={isDark ? '#3a250f' : '#6b461b'} strokeWidth="1.5" fill="none" />

        {/* Wooden cabin window/door cutout */}
        <rect
          x="75"
          y="20"
          width="22"
          height="16"
          rx="2"
          fill={isDark ? '#0b261b' : '#2b1b0e'}
        />
        {/* Window inner warm glow */}
        <rect
          x="77"
          y="22"
          width="18"
          height="12"
          rx="1"
          fill={isDark ? '#f59e0b' : '#ffedd5'}
          opacity="0.85"
        />
        {/* Window frame grid */}
        <line x1="86" y1="22" x2="86" y2="34" stroke={isDark ? '#593f1c' : '#7d5523'} strokeWidth="1" />

        {/* Front bow pole / steering oar */}
        <line x1="165" y1="36" x2="182" y2="30" stroke={isDark ? '#201509' : '#3d250f'} strokeWidth="2.5" />
        <line x1="12" y1="38" x2="2" y2="34" stroke={isDark ? '#201509' : '#3d250f'} strokeWidth="2.5" />
      </g>

      {/* Tropical leaf overlay in top right corner */}
      <g id="top-leaves" opacity={isDark ? 0.75 : 0.85}>
        <path
          d="M620 -10 Q 640 40 680 70 Q 650 65 620 40 Z"
          fill={`url(#palm-grad-${variant})`}
        />
        <path
          d="M660 -10 Q 675 35 710 60 Q 685 55 660 30 Z"
          fill={`url(#palm-grad-${variant})`}
        />
        <path
          d="M580 -20 Q 620 30 650 50 Q 625 45 590 20 Z"
          fill={isDark ? '#1b5a3e' : '#236e49'}
        />
      </g>
    </svg>
  );
}


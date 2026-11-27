import React from 'react';

interface PureFlowLogoProps {
  size?: number;
  className?: string;
}

export const PureFlowLogo: React.FC<PureFlowLogoProps> = ({
  size = 240,
  className = '',
}) => {
  const uniqueId = React.useId().replace(/:/g, '');
  const dropletClipId = `pf-droplet-clip-${uniqueId}`;
  const arcPathId = `pf-tagline-arc-${uniqueId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="PureFlow 360 Refresh, Refill, Renew"
    >
      <defs>
        {/* Droplet interior clip */}
        <clipPath id={dropletClipId}>
          <path d="M130 34 C130 34 73 102 73 145 C73 177 98.5 202 130 202 C161.5 202 187 177 187 145 C187 102 130 34 130 34 Z" />
        </clipPath>

        {/* Bottom arc path for "REFRESH, REFILL, RENEW" */}
        <path
          id={arcPathId}
          d="M 54 152 A 78 78 0 0 0 206 152"
        />

        <linearGradient id={`pf-drop-top-${uniqueId}`} x1="130" y1="34" x2="130" y2="165" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1B6AD1" />
          <stop offset="100%" stopColor="#2685E8" />
        </linearGradient>
      </defs>

      {/* Outer circular sky-blue badge */}
      <circle cx="130" cy="130" r="124" fill="#7AB3F6" />

      {/* White outer border of the water droplet */}
      <path
        d="M130 27 C130 27 67 99 67 146 C67 181 95.2 208 130 208 C164.8 208 193 181 193 146 C193 99 130 27 130 27 Z"
        fill="#FFFFFF"
      />

      {/* Clipped interior of the droplet */}
      <g clipPath={`url(#${dropletClipId})`}>
        {/* Deep blue base */}
        <rect x="65" y="28" width="130" height="182" fill={`url(#pf-drop-top-${uniqueId})`} />

        {/* Specular highlight streak on left curve */}
        <path
          d="M107 79 C95 96 87 114 84 128"
          stroke="#FFFFFF"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Three small white droplets on right curve */}
        <circle cx="135" cy="56" r="3.2" fill="#FFFFFF" />
        <circle cx="143" cy="65" r="2.7" fill="#FFFFFF" />
        <circle cx="151" cy="74" r="2.3" fill="#FFFFFF" />

        {/* Flowing wave 1: teal/mint ribbon */}
        <path
          d="M66 138 C92 126 116 149 144 137 C163 129 178 122 194 127 L194 210 L66 210 Z"
          fill="#52BDAA"
        />

        {/* Flowing wave 2: pale ice-blue ribbon */}
        <path
          d="M66 154 C96 168 126 142 156 153 C174 159 184 156 194 150 L194 210 L66 210 Z"
          fill="#B6DCFA"
        />

        {/* Flowing wave 3: medium sky-blue base wave */}
        <path
          d="M66 172 C100 186 135 170 165 177 C178 180 187 177 194 173 L194 210 L66 210 Z"
          fill="#6BA8EC"
        />
      </g>

      {/* "Pureflow" bold rounded wordmark overlapping droplet */}
      <text
        x="130"
        y="141"
        textAnchor="middle"
        fontFamily="Outfit, Plus Jakarta Sans, sans-serif"
        fontWeight="800"
        fontSize="43"
        letterSpacing="-1.2"
        fill="#FFFFFF"
        stroke="#4D89C8"
        strokeWidth="4.5"
        paintOrder="stroke fill"
      >
        Pureflow
      </text>

      {/* "360" outlined white numerals */}
      <text
        x="130"
        y="182"
        textAnchor="middle"
        fontFamily="Outfit, Plus Jakarta Sans, sans-serif"
        fontWeight="800"
        fontSize="41"
        letterSpacing="1"
        fill="#FFFFFF"
        stroke="#276C8C"
        strokeWidth="3.5"
        paintOrder="stroke fill"
      >
        360
      </text>

      {/* Curved bottom slogan */}
      <text
        fontFamily="Outfit, Plus Jakarta Sans, sans-serif"
        fontWeight="700"
        fontSize="11.5"
        letterSpacing="2.1"
        fill="#FFFFFF"
      >
        <textPath href={`#${arcPathId}`} startOffset="50%" textAnchor="middle">
          REFRESH, REFILL, RENEW
        </textPath>
      </text>
    </svg>
  );
};

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(){
  return new ImageResponse(
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="42%" r="72%">
          <stop offset="0%" stopColor="#111111"/>
          <stop offset="72%" stopColor="#060606"/>
          <stop offset="100%" stopColor="#000000"/>
        </radialGradient>
        <linearGradient id="red" x1="0%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#ff4650"/>
          <stop offset="28%" stopColor="#ff111d"/>
          <stop offset="58%" stopColor="#d00610"/>
          <stop offset="100%" stopColor="#760007"/>
        </linearGradient>
        <linearGradient id="bar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff2530"/>
          <stop offset="55%" stopColor="#e50914"/>
          <stop offset="100%" stopColor="#8a0008"/>
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="13" floodColor="#000000" floodOpacity=".42"/>
        </filter>
      </defs>
      <rect width="512" height="512" rx="108" fill="url(#bg)"/>
      <g filter="url(#soft)">
        <path fill="url(#red)" d="M375 177c-27-39-70-61-122-61-83 0-147 61-147 140 0 80 63 140 149 140 62 0 111-27 140-72v-89H254v58h78v12c-18 21-44 33-76 33-53 0-91-35-91-82 0-46 38-81 88-81 33 0 58 12 76 35l46-33Z"/>
        <path fill="url(#bar)" d="M276 235h119v58H276z"/>
      </g>
      <path d="M120 307c30 62 82 89 136 89 62 0 111-27 140-72v-19c-34 34-80 49-127 47-58-2-103-20-149-45Z" fill="#640007" opacity=".42"/>
    </svg>,
    {
      width:512,
      height:512,
      headers:{
        "Cache-Control":"public, max-age=31536000, immutable"
      }
    }
  );
}

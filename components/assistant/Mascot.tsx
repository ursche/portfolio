"use client";

import { useId } from "react";

type Props = {
  /** "full" is the whole character; "avatar" crops to the head for small icons. */
  variant?: "full" | "avatar";
  className?: string;
};

// Chibi pixel-art Urjala. Each character in the grids below is one pixel;
// "." is transparent. Edit the grids to change the drawing.
const PALETTE: Record<string, string> = {
  K: "#16121f", // hair
  k: "#3b2f5c", // hair shine
  S: "#e3ab84", // skin
  s: "#c48a63", // skin shadow
  E: "#1b1024", // eyes, lashes
  W: "#ffffff", // eye shine
  e: "#6b3a26", // iris
  i: "#a8673c", // iris, lower
  B: "#f2879a", // blush
  M: "#7a2838", // mouth
  m: "#e0707f", // tongue
  G: "#f0c75e", // gold earring
  T: "#f5f5f7", // white tee
  N: "#bfc4d0", // silver necklace, buckle
  J: "#1f1f28", // black blazer
  j: "#3a3a48", // blazer lapel shading
  P: "#f5f5f7", // pocket square
  L: "#2b1a12", // belt
  D: "#5b7fc0", // jeans
  d: "#425f99", // jeans seam
  F: "#e9e9ee", // shoes
};

const WIDTH = 32;
const HEIGHT = 40;

// Body without eyes, mouth or left arm; those are separate layers so they can animate.
const BASE = [
  "...........KKKKKKKKKK...........",
  ".........KKKKKKKKKKKKKK.........",
  "........KKKKKKkkkKKKKKKK........",
  ".......KKKKKkkKKKKKKKKKKK.......",
  "......KKKKKKKKKKKKKKKKKKKK......",
  ".....KKKKKKKKKKKKKKKKKKKKKK.....",
  ".....KKKKKKKKKKSKKKKKKKKKKK.....",
  "....KKKKKKKKKKSSSKKKKKKKKKKK....",
  "....KKKKKKKKKSSSSSKKKKKKKKKK....",
  "....KKKKKKKSSSSSSSSSKKKKKKKK....",
  "....KKKKKSSSSSSSSSSSSSKKKKKK....",
  "...KKKKKSSSSSSSSSSSSSSSKKKKKK...",
  "...KKKKSSSSSSSSSSSSSSSSSSKKKK...",
  "...KKKKSSSSSSSSSSSSSSSSSSKKKK...",
  "...KKKKSSSSSSSSSSSSSSSSSSKKKK...",
  "...KKKKSSSSSSSSSSSSSSSSSSKKKK...",
  "...KKKKSSSSSSSSSSSSSSSSSSKKKK...",
  "...KKKKSSSSSSSSSSSSSSSSSSGKKK...",
  "...KKKKSBBSSSSSSSSSSSSBBSGKKK...",
  "...KKKKSSSSSSSSSSSSSSSSSSSKKK...",
  "....KKKsSSSSSSSSSSSSSSSsKKKK....",
  ".....KK.ssSSSSSSSSSSSss.KKKK....",
  ".....K....sssSSSSSsss....KKK....",
  "..............SSS.........KkK...",
  "........JJJJJTSSSTJJJJJJ..KKK...",
  ".......JJJJJjTNTNTjJJJJJJ.KkK...",
  "......JJJJJJJjTNTjJJJJJJJJKKK...",
  "......JJJJJJJJjTTjJJJPPJJJJKk...",
  "......JJJJJJJJjTTjJJJJJJJJJJK...",
  "......JJJJJJJJjTTjJJJJJJJJJJJ...",
  "......JJJJJJJJjTTjJJJJJJJJjJJJ..",
  "......JJJJJJJJjTTjJJJJJJJJ.jJJ..",
  "......JJJJJJJJLLNSSSSJJJJJ..JJ..",
  "......JJJJJJJJjDDSSSSjJJJJ......",
  "......JJJJJJJJjDDdDDDjJJJJ......",
  ".......JJJJJJJJDDdDDJJJJJ.......",
  "..........DDDDDDd.dDDDDD........",
  "..........DDDDDD...DDDDD........",
  "..........DDDDD.....DDDD........",
  ".........FFFFFF.....FFFFF.......",
];

type Layer = { x: number; y: number; rows: string[] };

const EYES_OPEN: Layer = {
  x: 8,
  y: 12,
  rows: [
    "EEEEE......EEEEE",
    ".EWWE......EWWE.",
    ".EWEE......EWEE.",
    ".EeeE......EeeE.",
    ".EiiE......EiiE.",
    "..EE........EE..",
  ],
};

const EYES_BLINK: Layer = {
  x: 8,
  y: 15,
  rows: [".EEEE......EEEE."],
};

// Happy closed eyes (^ ^), shown while an answer is being written.
const EYES_HAPPY: Layer = {
  x: 8,
  y: 14,
  rows: ["..EE........EE..", ".E..E......E..E."],
};

const MOUTH: Layer = { x: 14, y: 18, rows: ["MMMM", ".mm."] };

const ARM_DOWN: Layer = { x: 5, y: 28, rows: ["J", "J", "JS", "SS", "SS"] };

const ARM_UP: Layer = {
  x: 2,
  y: 20,
  rows: [".j", "JJ", "JJJ", ".JJJ", "..JJJJ", "...JJJ"],
};

const HAND: Layer = { x: 1, y: 16, rows: [".S.S", ".SSS", "SSSS", ".SS."] };

function toRects(layer: Layer) {
  const out: { x: number; y: number; w: number; fill: string }[] = [];
  layer.rows.forEach((row, dy) => {
    let start = 0;
    for (let i = 1; i <= row.length; i++) {
      // Merge runs of the same color into one rect.
      if (i === row.length || row[i] !== row[start]) {
        const fill = PALETTE[row[start]];
        if (fill) out.push({ x: layer.x + start, y: layer.y + dy, w: i - start, fill });
        start = i;
      }
    }
  });
  return out;
}

const RECTS = {
  base: toRects({ x: 0, y: 0, rows: BASE }),
  eyesOpen: toRects(EYES_OPEN),
  eyesBlink: toRects(EYES_BLINK),
  eyesHappy: toRects(EYES_HAPPY),
  mouth: toRects(MOUTH),
  armDown: toRects(ARM_DOWN),
  armUp: toRects(ARM_UP),
  hand: toRects(HAND),
};

function Pixels({ rects, className }: { rects: ReturnType<typeof toRects>; className?: string }) {
  return (
    <g className={className}>
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </g>
  );
}

/**
 * Animations live in globals.css (.asst-*): bob, blink, wave on hover or
 * greeting, and happy closed eyes while thinking.
 */
export default function Mascot({ variant = "full", className }: Props) {
  // useId returns ":r0:"-style ids; colons break url(#id) in some browsers.
  const outline = `${useId().replace(/:/g, "")}-outline`;
  const full = variant === "full";

  return (
    <svg
      className={className}
      viewBox={full ? `-1 -1 ${WIDTH + 2} ${HEIGHT + 2}` : "2 -1 28 25"}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* One-pixel neon outline so the black hair and blazer stand out on the dark site */}
        <filter id={outline} x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="grown" />
          <feFlood floodColor="#8b5cf6" />
          <feComposite in2="grown" operator="in" result="edge" />
          <feMerge>
            <feMergeNode in="edge" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${outline})`}>
        <g className={full ? "asst-bob" : undefined}>
          <Pixels rects={RECTS.base} />
          <Pixels rects={RECTS.mouth} />
          <Pixels rects={RECTS.eyesOpen} className="asst-eyes-open" />
          <Pixels rects={RECTS.eyesBlink} className="asst-eyes-blink" />
          <Pixels rects={RECTS.eyesHappy} className="asst-eyes-happy" />
          {full && (
            <>
              <Pixels rects={RECTS.armDown} className="asst-arm-down" />
              <g className="asst-arm-up">
                <Pixels rects={RECTS.armUp} />
                <Pixels rects={RECTS.hand} className="asst-hand" />
              </g>
            </>
          )}
        </g>
      </g>
    </svg>
  );
}

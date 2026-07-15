"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { scrollState } from "@/lib/scroll";

const { damp, lerp } = THREE.MathUtils;

/* ------------------------------------------------------------------ */
/* Camera rig: mouse parallax + scroll-driven dolly/orbit              */
/* ------------------------------------------------------------------ */

function CameraRig() {
  useFrame((state, dt) => {
    const p = scrollState.progress;
    const { camera, pointer } = state;

    // Scroll drives a slow dolly-in and vertical drift through the scene.
    const targetX = pointer.x * 0.9 + Math.sin(p * Math.PI * 2) * 1.2;
    const targetY = pointer.y * 0.6 - p * 2.2;
    const targetZ = 9 - p * 2.5;

    camera.position.x = damp(camera.position.x, targetX, 2.5, dt);
    camera.position.y = damp(camera.position.y, targetY, 2.5, dt);
    camera.position.z = damp(camera.position.z, targetZ, 2.5, dt);
    camera.lookAt(0, -p * 2.2, 0);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Hero centerpiece: distorted torus knot chasing the cursor           */
/* ------------------------------------------------------------------ */

function HeroCore() {
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<any>(null!);

  useFrame((state, dt) => {
    const p = scrollState.progress;
    const v = Math.abs(scrollState.velocity);
    const m = mesh.current;

    m.rotation.x += dt * 0.25;
    m.rotation.y += dt * 0.35 + v * 0.0015;

    // Lean toward the cursor.
    m.rotation.x = damp(m.rotation.x, m.rotation.x + state.pointer.y * 0.3, 2, dt);
    m.position.x = damp(m.position.x, state.pointer.x * 0.8, 2, dt);
    m.position.y = damp(m.position.y, state.pointer.y * 0.5, 2, dt);

    // Shrink and hand the stage over as the user scrolls past the hero.
    const s = Math.max(0.25, 1 - p * 1.6);
    m.scale.setScalar(damp(m.scale.x, s, 3, dt));

    // Scroll velocity agitates the distortion - the "alive" feel.
    if (mat.current) {
      mat.current.distort = damp(mat.current.distort, 0.35 + Math.min(v * 0.01, 0.35), 3, dt);
    }
  });

  return (
    <mesh ref={mesh}>
      {/* 180x24 keeps the silhouette smooth at a fraction of default cost */}
      <torusKnotGeometry args={[1.15, 0.34, 180, 24]} />
      <MeshDistortMaterial
        ref={mat}
        color="#8b5cf6"
        emissive="#2e1065"
        roughness={0.15}
        metalness={0.85}
        distort={0.35}
        speed={2.2}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Starfield: one draw call, 2400 points, spun by scroll               */
/* ------------------------------------------------------------------ */

function Particles({ count = 2400 }: { count?: number }) {
  const points = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Hollow sphere shell so particles never clip the camera.
      const r = 7 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    points.current.rotation.y += dt * 0.02 + scrollState.velocity * 0.00025;
    points.current.rotation.x = scrollState.progress * 0.6;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#22d3ee"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Floating wireframe debris: shared geometries, drifts with scroll    */
/* ------------------------------------------------------------------ */

const DEBRIS: {
  pos: [number, number, number];
  scale: number;
  geo: "ico" | "oct" | "torus";
  color: string;
}[] = [
  { pos: [-4.2, 1.6, -2], scale: 0.7, geo: "ico", color: "#8b5cf6" },
  { pos: [4.4, -1.2, -3], scale: 0.9, geo: "oct", color: "#22d3ee" },
  { pos: [-3.4, -2.6, -1], scale: 0.5, geo: "torus", color: "#fb7185" },
  { pos: [3.2, 2.4, -4], scale: 0.6, geo: "ico", color: "#22d3ee" },
  { pos: [-5.5, -0.4, -5], scale: 1.1, geo: "oct", color: "#8b5cf6" },
  { pos: [5.6, 0.8, -6], scale: 1.3, geo: "torus", color: "#8b5cf6" },
  { pos: [0.4, -4.6, -3], scale: 0.8, geo: "ico", color: "#fb7185" },
  { pos: [-2.2, -7.2, -2], scale: 0.7, geo: "oct", color: "#22d3ee" },
  { pos: [2.8, -9.6, -4], scale: 1.0, geo: "torus", color: "#8b5cf6" },
  { pos: [-4.6, -12.0, -3], scale: 0.9, geo: "ico", color: "#22d3ee" },
];

function Debris() {
  const group = useRef<THREE.Group>(null!);

  // One geometry instance per shape type, shared across all meshes.
  const geos = useMemo(
    () => ({
      ico: new THREE.IcosahedronGeometry(1, 0),
      oct: new THREE.OctahedronGeometry(1, 0),
      torus: new THREE.TorusGeometry(1, 0.35, 10, 28),
    }),
    []
  );

  useFrame((_, dt) => {
    // The debris field slowly counter-rotates against the camera dolly.
    group.current.rotation.y = damp(
      group.current.rotation.y,
      scrollState.progress * Math.PI * 0.5,
      1.5,
      dt
    );
  });

  return (
    <group ref={group}>
      {DEBRIS.map((d, i) => (
        <Float
          key={i}
          speed={1.2 + (i % 3) * 0.5}
          rotationIntensity={1.4}
          floatIntensity={1.8}
        >
          <mesh geometry={geos[d.geo]} position={d.pos} scale={d.scale}>
            <meshStandardMaterial
              color={d.color}
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Skill rings: two glowing torus "orbits" deeper down the page        */
/* ------------------------------------------------------------------ */

function SkillRings() {
  const a = useRef<THREE.Mesh>(null!);
  const b = useRef<THREE.Mesh>(null!);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    a.current.rotation.x = t * 0.4;
    a.current.rotation.y = t * 0.2;
    b.current.rotation.x = -t * 0.3;
    b.current.rotation.z = t * 0.25;

    // Only fully visible mid-page (skills section) - fade with scroll.
    const p = scrollState.progress;
    const vis = THREE.MathUtils.smoothstep(p, 0.25, 0.5) * (1 - THREE.MathUtils.smoothstep(p, 0.75, 0.95));
    (a.current.material as THREE.MeshStandardMaterial).opacity = lerp(0, 0.85, vis);
    (b.current.material as THREE.MeshStandardMaterial).opacity = lerp(0, 0.6, vis);
  });

  return (
    <group position={[0, -6.5, -2]}>
      <mesh ref={a}>
        <torusGeometry args={[2.4, 0.02, 8, 96]} />
        <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={2} transparent />
      </mesh>
      <mesh ref={b}>
        <torusGeometry args={[3.1, 0.02, 8, 96]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} transparent />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */

export default function Experience() {
  return (
    <>
      <color attach="background" args={["#060010"]} />
      <fog attach="fog" args={["#060010", 9, 26]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 6]} intensity={60} color="#8b5cf6" />
      <pointLight position={[-6, -4, 4]} intensity={40} color="#22d3ee" />

      <CameraRig />
      <HeroCore />
      <Particles />
      <Debris />
      <SkillRings />
    </>
  );
}

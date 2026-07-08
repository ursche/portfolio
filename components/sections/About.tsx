"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import TiltCard from "@/components/TiltCard";
import { staggerContainer, fadeUp, slideFromLeft } from "@/lib/variants";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-32">
      <div className="grid items-center gap-16 md:grid-cols-2">
        {/* Photo with 3D tilt + glare + floating frame */}
        <motion.div
          variants={slideFromLeft}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <TiltCard className="mx-auto aspect-[4/5] w-full max-w-sm">
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
              {/* Replace public/me.svg with your actual photo (public/me.jpg) */}
              <Image
                src="/me.svg"
                alt="Urjala Pariyar"
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-cover"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
            </div>
            {/* Elements lifted off the card plane for real depth */}
            <div
              style={{ transform: "translateZ(50px)" }}
              className="absolute -bottom-4 -right-4 rounded-xl border border-neon/40 bg-void/80 px-4 py-2 backdrop-blur"
            >
              <p className="font-mono text-xs text-laser">/urjala.pariyar</p>
            </div>
          </TiltCard>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p variants={fadeUp} className="font-mono text-sm uppercase tracking-[0.4em] text-laser">
            About me
          </motion.p>
          <motion.h2 variants={fadeUp} className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            Full-stack, <span className="text-neon">two engines</span>.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-6 leading-relaxed text-neutral-400">
            I&apos;m Urjala — a developer who lives on both sides of the request.
            On the backend I build robust, elegant APIs and applications with{" "}
            <span className="text-ember">Laravel</span>; on the frontend I turn
            them into fast, animated, human interfaces with{" "}
            <span className="text-laser">React</span>.
          </motion.p>
          <motion.p variants={fadeUp} className="mt-4 leading-relaxed text-neutral-400">
            I care about the details most people scroll past: query counts,
            bundle sizes, easing curves, and the 16 milliseconds every frame
            gets to earn its place.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex gap-8">
            {[
              ["Laravel", "Backend craft"],
              ["React", "Frontend motion"],
              ["MySQL", "Data modeling"],
            ].map(([title, sub]) => (
              <div key={title}>
                <p className="font-display text-lg font-semibold text-white">{title}</p>
                <p className="text-sm text-neutral-500">{sub}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

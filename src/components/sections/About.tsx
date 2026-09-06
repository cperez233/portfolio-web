"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { aboutAssets, aboutText } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * About con revelado caracter a caracter y cuatro assets 3D flotando
 * en las esquinas. Los assets son decorativos: alt vacio y aria-hidden.
 */
export function About() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="about"
      className="relative flex min-h-screen items-center justify-center overflow-x-clip px-5 py-20 sm:px-8 md:px-10"
    >
      {/* Assets 3D de esquina */}
      {aboutAssets.map((asset, index) => (
        <motion.div
          key={asset.src}
          aria-hidden="true"
          className={cn("pointer-events-none absolute z-0", asset.className)}
          initial={
            shouldReduceMotion
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.7 }
          }
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.8,
            delay: shouldReduceMotion ? 0 : index * 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Image
            src={asset.src}
            alt={asset.alt}
            width={128}
            height={128}
            loading="lazy"
            sizes="(min-width: 768px) 128px, 64px"
            className="h-auto w-full"
          />
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight"
          style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
        >
          About me
        </h2>

        <AnimatedText
          text={aboutText}
          className="mx-auto mt-10 max-w-3xl text-left text-base leading-relaxed text-[#D7E2EA] sm:text-lg md:text-xl"
        />
      </div>
    </section>
  );
}

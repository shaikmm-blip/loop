"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ArrowDown, ArrowRight, Network } from "lucide-react";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
    src: string;
    index: number;
    total: number;
    phase: AnimationPhase;
    label: { role: string; firm: string };
    target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

// --- FlipCard Component ---
const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

function FlipCard({ src, index, label, target }: FlipCardProps) {
    return (
        <motion.div
            animate={{
                x: target.x,
                y: target.y,
                rotate: target.rotation,
                scale: target.scale,
                opacity: target.opacity,
            }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
            style={{
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className="cursor-pointer group"
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ rotateY: 180 }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-200"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`hero-${index}`} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
                </div>

                {/* Back Face — a mini contact label */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-[#0A0A0F] flex flex-col items-center justify-center p-1.5 border border-[#6366F1]/40"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div className="mb-1 h-1.5 w-1.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_#6366F1]" />
                    <p className="text-[6px] font-bold uppercase tracking-widest text-[#A5B4FC] leading-tight text-center">
                        {label.role}
                    </p>
                    <p className="mt-0.5 text-[8px] font-semibold text-white leading-tight text-center">{label.firm}</p>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 3000; // Virtual scroll range

const IMAGES = [
    "https://cdn.21st.dev/assets/mirror/4d/4d1bff4ea8b9f400dff7ae405f92e15bd39ec76e9285c7d96017e64ba1de3ae1.jpg",
    "https://cdn.21st.dev/assets/mirror/ee/ee36e332fe99d7611c43b90511db08a4f84e4545caa78e7b52e9ccffe273864b.jpg",
    "https://cdn.21st.dev/assets/mirror/dd/dddeaa4e6132c65bf7ff99d197f792a30937b5cbfe97a2b1ee54a793684df52e.jpg",
    "https://cdn.21st.dev/assets/mirror/48/487977107b5011b5e1c25289f6e4393ef555e1a92daee554788e9363b233ca14.jpg",
    "https://cdn.21st.dev/assets/mirror/a1/a12509688be6c9d3b2cb26d2ea1cfce48b8a8dbf2653e17be8a3fc31bd69f162.jpg",
    "https://cdn.21st.dev/assets/mirror/05/051f9e565b5b0b221384d9c27a0760febc3fb48d190c046adfda579f3614c958.jpg",
    "https://cdn.21st.dev/assets/mirror/87/87d4f60a4465d19d14b8acefa46275df4ccd767ccea6d7f234ea5bad99cfec56.jpg",
    "https://cdn.21st.dev/assets/mirror/06/0610989e0675a12c02d35aa5464e2644bf77913214b748b73a894808d2d79877.jpg",
    "https://cdn.21st.dev/assets/mirror/fe/fe90b90751e671a9526134c4743e2fcbf6c1a24991aba273ad7418c88fc9c701.jpg",
    "https://cdn.21st.dev/assets/mirror/2e/2e0452c1994fcc2130a1b8ef68e34b5ea52d1b35b80dde09b99349ad1de54598.jpg",
    "https://cdn.21st.dev/assets/mirror/84/847dc523558808119dc4bbb5218ff862ae5f5b455f33e9a0304f2f5a4b2f0f2c.jpg",
    "https://cdn.21st.dev/assets/mirror/2f/2f128763d177d6bdda3de9f0a766693406034977082bdb542138b7b74af9697b.jpg",
    "https://cdn.21st.dev/assets/mirror/30/30f8223f1d1ecc24fc8b7a9995b8ee98449b1e9fc300c14fbccec01b6a83a0ae.jpg",
    "https://cdn.21st.dev/assets/mirror/b4/b4df0e3e425ffce3b4f62fd7bc717e4dc90b94455f4d65d64fc07fe9721b0519.jpg",
    "https://cdn.21st.dev/assets/mirror/90/90c625659f072e4a701c2e37fa4ca46f25c7ca8689d723e7802fe84cf17874e9.jpg",
    "https://cdn.21st.dev/assets/mirror/6a/6aa0befc69cc3db8f3f3558d4b5e1216a5b64ceae1b86f51acf1c3f1432a8cf7.jpg",
    "https://cdn.21st.dev/assets/mirror/dc/dc126cfd753dc217945d0ea2f915e539dfe4ffb5fdea02245d0f576b25a9c4dd.jpg",
    "https://cdn.21st.dev/assets/mirror/ab/ab5f167fcb763aee7c3247fb8af97875998a7f519a6119da7dadd9cf73ae1a2c.jpg",
    "https://cdn.21st.dev/assets/mirror/57/57d6e450f7068e5f3be04907dcc0815343e67df1dc82f2da0ff1c859afc1f700.jpg",
    "https://cdn.21st.dev/assets/mirror/e4/e491359016d1494074e287dfbb55be068cffc0110017ae2257a5d4cdec193a47.jpg",
];

const LABELS = [
    { role: "VP", firm: "Blackstone" },
    { role: "Partner", firm: "KKR" },
    { role: "Founder", firm: "Cincy" },
    { role: "Analyst", firm: "Goldman" },
    { role: "Principal", firm: "a16z" },
    { role: "MD", firm: "Bain Cap" },
    { role: "Director", firm: "P&G Ventures" },
    { role: "Associate", firm: "Evercore" },
    { role: "Founder", firm: "Columbus" },
    { role: "VP", firm: "Fifth Third" },
    { role: "Partner", firm: "Sequoia" },
    { role: "Alum", firm: "FSB '19" },
    { role: "PM", firm: "Kroger" },
    { role: "Associate", firm: "Lazard" },
    { role: "Partner", firm: "CincyTech" },
    { role: "VP", firm: "Morgan Stanley" },
    { role: "Founder", firm: "NYC" },
    { role: "MD", firm: "JPMorgan" },
    { role: "Principal", firm: "Drive Cap" },
    { role: "Analyst", firm: "Centerview" },
];

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function IntroAnimation({ nextSectionId = "gone-cold" }: { nextSectionId?: string }) {
    const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Container Size ---
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        });
        observer.observe(containerRef.current);
        setContainerSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
        return () => observer.disconnect();
    }, []);

    // --- Virtual Scroll Logic (with pass-through to the page) ---
    const virtualScroll = useMotionValue(0);
    const scrollRef = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Returns true if the hero should consume this delta (i.e. page should NOT scroll)
        const shouldCapture = (deltaY: number) => {
            // If the page is already scrolled past the top, let the page handle upward scrolls first.
            if (window.scrollY > 2) return false;
            if (deltaY > 0 && scrollRef.current >= MAX_SCROLL) return false; // done — release to page
            if (deltaY < 0 && scrollRef.current <= 0) return false; // at the start — release to page
            return true;
        };

        const apply = (deltaY: number) => {
            const newScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), MAX_SCROLL);
            scrollRef.current = newScroll;
            virtualScroll.set(newScroll);
        };

        const handleWheel = (e: WheelEvent) => {
            if (!shouldCapture(e.deltaY)) return;
            e.preventDefault();
            apply(e.deltaY);
        };

        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };
        const handleTouchMove = (e: TouchEvent) => {
            const touchY = e.touches[0].clientY;
            const deltaY = (touchStartY - touchY) * 2.5;
            touchStartY = touchY;
            if (!shouldCapture(deltaY)) return;
            e.preventDefault();
            apply(deltaY);
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        container.addEventListener("touchstart", handleTouchStart, { passive: true });
        container.addEventListener("touchmove", handleTouchMove, { passive: false });
        return () => {
            container.removeEventListener("wheel", handleWheel);
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
        };
    }, [virtualScroll]);

    const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });
    const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360]);
    const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

    // --- Mouse Parallax ---
    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouseX.set(normalizedX * 100);
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    // --- Intro Sequence ---
    useEffect(() => {
        const timer1 = setTimeout(() => setIntroPhase("line"), 500);
        const timer2 = setTimeout(() => setIntroPhase("circle"), 2500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    // --- Random Scatter Positions (client-only to avoid hydration drift) ---
    const scatterPositions = useMemo(() => {
        return IMAGES.map((_, i) => {
            const r = (n: number) => {
                const x = Math.sin(i * 9301 + n * 49297) * 233280;
                return x - Math.floor(x);
            };
            return {
                x: (r(1) - 0.5) * 1500,
                y: (r(2) - 0.5) * 1000,
                rotation: (r(3) - 0.5) * 180,
                scale: 0.6,
                opacity: 0,
            };
        });
    }, []);

    const [morphValue, setMorphValue] = useState(0);
    const [rotateValue, setRotateValue] = useState(0);
    const [parallaxValue, setParallaxValue] = useState(0);

    useEffect(() => {
        const a = smoothMorph.on("change", setMorphValue);
        const b = smoothScrollRotate.on("change", setRotateValue);
        const c = smoothMouseX.on("change", setParallaxValue);
        return () => {
            a();
            b();
            c();
        };
    }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

    const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
    const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

    const scrollToNext = () => {
        scrollRef.current = MAX_SCROLL;
        virtualScroll.set(MAX_SCROLL);
        document.getElementById(nextSectionId)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-[#FAFAFA] overflow-hidden">
            {/* soft indigo glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6366F1]/10 blur-[120px]" />

            <div className="flex h-full w-full flex-col items-center justify-center perspective-1000">
                {/* Intro Text (Fades out) */}
                <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={
                            introPhase === "circle" && morphValue < 0.5
                                ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                                : { opacity: 0, filter: "blur(10px)" }
                        }
                        transition={{ duration: 1 }}
                        className="text-2xl font-semibold tracking-tight text-[#0A0A0F] md:text-4xl"
                    >
                        You meet 50 people a semester.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 0.6 - morphValue } : { opacity: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mt-4 text-[10px] md:text-xs font-bold tracking-[0.2em] text-neutral-500"
                    >
                        SCROLL TO SEE WHAT HAPPENS TO THEM
                    </motion.p>
                </div>

                {/* Arc Active Content (Fades in) */}
                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="absolute top-[12%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-5"
                >
                    <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#6366F1]/20 bg-white/80 px-3 py-1 text-xs font-medium text-[#6366F1] shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#6366F1] animate-pulse" /> Built for students who network
                    </span>
                    <h2 className="text-4xl md:text-6xl font-semibold text-[#0A0A0F] tracking-[-0.035em] mb-4 max-w-3xl leading-[1.02]">
                        Never lose a connection again.
                    </h2>
                    <p className="text-sm md:text-base text-neutral-600 max-w-xl leading-relaxed">
                        Loop remembers everyone you coffee chat with, tracks what&apos;s happening in their world, and writes the
                        perfect follow-up. You just hit send.
                    </p>
                    <div
                        className="mt-7 flex flex-wrap items-center justify-center gap-3"
                        style={{ pointerEvents: morphValue > 0.85 ? "auto" : "none" }}
                    >
                        <Link href="/new" className="btn-primary !px-6 !py-3">
                            Start free <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/map" className="btn-secondary !px-6 !py-3">
                            <Network className="h-4 w-4" /> See your network
                        </Link>
                    </div>
                </motion.div>

                {/* Cards */}
                <div className="relative flex items-center justify-center w-full h-full">
                    {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
                        let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

                        if (introPhase === "scatter") {
                            target = scatterPositions[i];
                        } else if (introPhase === "line") {
                            const lineSpacing = 70;
                            const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                            const lineX = i * lineSpacing - lineTotalWidth / 2;
                            target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
                        } else {
                            const isMobile = containerSize.width < 768;
                            const minDimension = Math.min(containerSize.width, containerSize.height);

                            const circleRadius = Math.min(minDimension * 0.35, 350);
                            const circleAngle = (i / TOTAL_IMAGES) * 360;
                            const circleRad = (circleAngle * Math.PI) / 180;
                            const circlePos = {
                                x: Math.cos(circleRad) * circleRadius,
                                y: Math.sin(circleRad) * circleRadius,
                                rotation: circleAngle + 90,
                            };

                            const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                            const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
                            const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
                            const arcCenterY = arcApexY + arcRadius;
                            const spreadAngle = isMobile ? 100 : 130;
                            const startAngle = -90 - spreadAngle / 2;
                            const step = spreadAngle / (TOTAL_IMAGES - 1);

                            const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
                            const maxRotation = spreadAngle * 0.8;
                            const boundedRotation = -scrollProgress * maxRotation;

                            const currentArcAngle = startAngle + i * step + boundedRotation;
                            const arcRad = (currentArcAngle * Math.PI) / 180;

                            const arcPos = {
                                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                                rotation: currentArcAngle + 90,
                                scale: isMobile ? 1.4 : 1.8,
                            };

                            target = {
                                x: lerp(circlePos.x, arcPos.x, morphValue),
                                y: lerp(circlePos.y, arcPos.y, morphValue),
                                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                                scale: lerp(1, arcPos.scale, morphValue),
                                opacity: 1,
                            };
                        }

                        return (
                            <FlipCard
                                key={i}
                                src={src}
                                index={i}
                                total={TOTAL_IMAGES}
                                phase={introPhase}
                                label={LABELS[i % LABELS.length]}
                                target={target}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Scroll-to-next button */}
            <motion.button
                onClick={scrollToNext}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3 }}
                aria-label="Scroll to next section"
                className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/90 text-[#0A0A0F] shadow-lg backdrop-blur transition-all hover:border-[#6366F1]/40 hover:text-[#6366F1] hover:shadow-[0_8px_24px_-6px_rgba(99,102,241,0.5)]"
            >
                <ArrowDown className="h-4 w-4 animate-bounce" />
            </motion.button>
        </div>
    );
}

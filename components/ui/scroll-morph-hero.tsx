"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ArrowDown, ArrowRight, Network } from "lucide-react";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

type Person = { name: string; role: string; firm: string; status: "warm" | "cooling" | "cold"; last: string; grad: string };

interface FlipCardProps {
    person: Person;
    index: number;
    total: number;
    phase: AnimationPhase;
    target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

// --- FlipCard Component ---
const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

const DOT = { warm: "bg-emerald-500", cooling: "bg-amber-500", cold: "bg-slate-400" } as const;
const STATUS_TEXT = { warm: "Warm", cooling: "Cooling", cold: "Gone cold" } as const;

function FlipCard({ person, target }: FlipCardProps) {
    const initials = person.name.split(" ").map((p) => p[0]).join("");
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
                {/* Front Face — mini profile card */}
                <div
                    className="absolute inset-0 flex h-full w-full flex-col items-center overflow-hidden rounded-xl border border-black/[0.06] bg-white px-1 pt-2 shadow-[0_6px_18px_-6px_rgba(10,10,15,0.25)]"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <div className={`absolute inset-x-0 top-0 h-5 bg-gradient-to-br ${person.grad} opacity-20`} />
                    <div className="relative">
                        <div className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${person.grad} text-[9px] font-semibold text-white ring-2 ring-white`}>
                            {initials}
                        </div>
                        <span className={`absolute -bottom-0 -right-0 h-2 w-2 rounded-full ring-[1.5px] ring-white ${DOT[person.status]}`} />
                    </div>
                    <p className="mt-1.5 w-full truncate text-center text-[6.5px] font-semibold leading-tight tracking-tight text-[#0A0A0F]">{person.name}</p>
                    <p className="w-full truncate text-center text-[5.5px] leading-tight text-neutral-500">{person.role}</p>
                    <p className="w-full truncate text-center text-[5.5px] font-medium leading-tight text-[#6366F1]">{person.firm}</p>
                    <div className="mt-auto mb-1.5 flex gap-0.5">
                        <span className="h-0.5 w-3 rounded-full bg-neutral-200" />
                        <span className="h-0.5 w-2 rounded-full bg-neutral-200" />
                    </div>
                </div>

                {/* Back Face — relationship status */}
                <div
                    className="absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-[#6366F1]/40 bg-[#0A0A0F] p-1.5 shadow-lg"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div className={`mb-1 h-1.5 w-1.5 rounded-full ${DOT[person.status]} shadow-[0_0_8px_currentColor]`} />
                    <p className="text-center text-[6px] font-bold uppercase leading-tight tracking-widest text-[#A5B4FC]">
                        {STATUS_TEXT[person.status]}
                    </p>
                    <p className="mt-0.5 text-center text-[6px] leading-tight text-white/70">Last chat</p>
                    <p className="text-center text-[7px] font-semibold leading-tight text-white">{person.last}</p>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 3000; // Virtual scroll range

const G = [
    "from-indigo-500 to-violet-500",
    "from-sky-500 to-indigo-500",
    "from-fuchsia-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-slate-600 to-slate-800",
];

// Fictional people a student might meet in a semester
const PEOPLE: Person[] = ([
    { name: "Sarah Chen", role: "Vice President", firm: "Blackstone", status: "cold", last: "2 semesters ago" },
    { name: "Marcus Lee", role: "Partner", firm: "KKR", status: "cooling", last: "6 weeks ago" },
    { name: "Jake Morrison", role: "Founder & CEO", firm: "Lumen Health", status: "cooling", last: "45 days ago" },
    { name: "Rachel Okafor", role: "Associate", firm: "Goldman Sachs", status: "warm", last: "2 weeks ago" },
    { name: "Priya Nair", role: "Partner", firm: "a16z", status: "cold", last: "5 months ago" },
    { name: "Sam Ortiz", role: "Principal", firm: "Bain Capital", status: "warm", last: "9 days ago" },
    { name: "Ben Alvarez", role: "Director", firm: "P&G Ventures", status: "cold", last: "8 months ago" },
    { name: "Nate Fischer", role: "Associate", firm: "Evercore", status: "cooling", last: "1 month ago" },
    { name: "Hannah Brooks", role: "Associate", firm: "Drive Capital", status: "warm", last: "5 days ago" },
    { name: "Marcus Reed", role: "Managing Director", firm: "Fifth Third", status: "cold", last: "7 months ago" },
    { name: "Olivia Grant", role: "Investor", firm: "Sequoia", status: "cold", last: "1 year ago" },
    { name: "Jordan Ellis", role: "FSB Alum '19", firm: "Evercore", status: "cold", last: "8 months ago" },
    { name: "Leo Martin", role: "VP Digital", firm: "Kroger", status: "warm", last: "3 days ago" },
    { name: "Mia Johnson", role: "Associate", firm: "Lazard", status: "cooling", last: "7 weeks ago" },
    { name: "Maya Patel", role: "Partner", firm: "CincyTech", status: "warm", last: "6 days ago" },
    { name: "Daniel Park", role: "Vice President", firm: "Morgan Stanley", status: "cold", last: "4 months ago" },
    { name: "Ava Thompson", role: "Founder", firm: "Stealth · NYC", status: "cooling", last: "1 month ago" },
    { name: "Chris Wang", role: "Managing Director", firm: "JPMorgan", status: "cold", last: "6 months ago" },
    { name: "David Kim", role: "Vice President", firm: "Blackstone", status: "warm", last: "12 days ago" },
    { name: "Grace Liu", role: "Analyst", firm: "Centerview", status: "cooling", last: "5 weeks ago" },
] as Omit<Person, "grad">[]).map((p, i) => ({ ...p, grad: G[i % G.length] }));
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
        return PEOPLE.map((_, i) => {
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
                    {PEOPLE.slice(0, TOTAL_IMAGES).map((person, i) => {
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
                                person={person}
                                index={i}
                                total={TOTAL_IMAGES}
                                phase={introPhase}
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

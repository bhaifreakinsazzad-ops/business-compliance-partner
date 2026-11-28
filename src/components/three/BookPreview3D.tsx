"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import * as THREE from "three";
import { BookOpen, RotateCcw, RotateCw } from "lucide-react";
import type { PublicBookPreview } from "@/types/domain";
import { resolveBookCoverAsset } from "@/lib/config/media-manifest";
import {
  attachContextLossRecovery,
  awaitWebGLFrameFence,
  createContactShadowTexture,
  createDeltaTimer,
  createResizeObserver,
  createRoomEnvironmentTexture,
  detectSoftwareWebGL,
  disposeObject3D,
  disposeRoomEnvironment,
  type RoomEnvironmentResources,
} from "@/components/three/threeUtils";

interface BookPreview3DProps {
  book: PublicBookPreview;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(" ");
  let line = "";
  let y = startY;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
  return y + lineHeight;
}

function createFrontCoverTexture(
  book: PublicBookPreview,
  logoImage?: HTMLImageElement | null,
  governedCoverImage?: HTMLImageElement | null,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    if (
      governedCoverImage &&
      governedCoverImage.complete &&
      governedCoverImage.naturalWidth > 0
    ) {
      ctx.drawImage(governedCoverImage, 0, 0, 512, 720);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      return tex;
    }

    const { coverHex, accentHex, textHex, spineHex } = book.coverPalette;
    ctx.fillStyle = coverHex;
    ctx.fillRect(0, 0, 512, 720);

    const crease = ctx.createLinearGradient(0, 0, 48, 0);
    crease.addColorStop(0, spineHex);
    crease.addColorStop(0.5, "rgba(0,0,0,0.28)");
    crease.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = crease;
    ctx.fillRect(0, 0, 48, 720);

    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 440, 648);

    ctx.fillStyle = accentHex;
    ctx.font = "700 18px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(book.categoryNameEn.toUpperCase(), 256, 72);

    ctx.fillStyle = accentHex;
    ctx.fillRect(156, 106, 200, 2);

    ctx.fillStyle = textHex;
    ctx.font = "700 32px Georgia, serif";
    const nextY = wrapCanvasText(ctx, book.titleEn, 256, 148, 380, 42);

    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = "500 18px Inter, sans-serif";
    wrapCanvasText(
      ctx,
      "Business Compliance Partner Edition",
      256,
      Math.max(nextY + 18, 320),
      360,
      26,
    );

    if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(256, 515, 62, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImage, 194, 453, 124, 124);
      ctx.restore();
    } else {
      ctx.strokeStyle = accentHex;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(256, 515, 58, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = accentHex;
    ctx.font = "700 16px Inter, sans-serif";
    ctx.fillText("BUSINESS COMPLIANCE PARTNER", 256, 616);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createBackCoverTexture(book: PublicBookPreview): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const { coverHex, accentHex, textHex } = book.coverPalette;
    ctx.fillStyle = coverHex;
    ctx.fillRect(0, 0, 512, 720);

    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, 440, 648);

    ctx.fillStyle = accentHex;
    ctx.font = "700 18px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(
      book.availabilityState === "PUBLISHED_PRICED"
        ? "PUBLISHED EDITION OVERVIEW"
        : "UPCOMING EDITION PREVIEW",
      64,
      72,
    );

    ctx.fillStyle = textHex;
    ctx.font = "600 22px Georgia, serif";
    let y = wrapCanvasText(ctx, book.titleEn, 64, 118, 384, 30);

    ctx.fillStyle = accentHex;
    ctx.fillRect(64, y + 12, 160, 2);

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "400 17px Inter, sans-serif";
    y = y + 36;
    book.topicsBn.slice(0, 4).forEach((_, i) => {
      ctx.fillText(
        `• Module 0${i + 1}: Core Regulatory Guide`,
        64,
        y + i * 34,
        384,
      );
    });

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "500 15px Inter, sans-serif";
    ctx.fillText(
      book.availabilityState === "PUBLISHED_PRICED"
        ? "Verified Commercial Edition"
        : "Upcoming Reference Edition Preview",
      64,
      595,
    );
    ctx.fillText("Business Compliance Partner • Bangladesh", 64, 624);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createInsideSpreadTexture(book: PublicBookPreview): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#F6F2E9";
    ctx.fillRect(0, 0, 512, 720);

    const paperGutter = ctx.createLinearGradient(0, 0, 48, 0);
    paperGutter.addColorStop(0, "rgba(0,0,0,0.22)");
    paperGutter.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = paperGutter;
    ctx.fillRect(0, 0, 48, 720);

    ctx.strokeStyle = "#C59028";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(32, 32, 448, 656);

    ctx.strokeStyle = "#E1E4F2";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(38, 38, 436, 644);

    ctx.fillStyle = "#243FBA";
    ctx.font = "700 13px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BCP OFFICIAL REFERENCE • বিষয় সূচিপত্র", 256, 70);

    ctx.fillStyle = "#C59028";
    ctx.fillRect(150, 86, 212, 2);

    ctx.fillStyle = "#081838";
    ctx.font = "700 20px Georgia, serif";
    wrapCanvasText(ctx, book.titleBn, 256, 112, 400, 26);

    const chapters = [
      { num: "০১", title: "আইনগত ভিত্তি ও সাধারণ নির্দেশনা", p: "১৫" },
      { num: "০২", title: "ধাপে ধাপে কমপ্লায়েন্স ও আবেদন কার্যপ্রণালী", p: "৪৭" },
      { num: "০৩", title: "সরকারি পোর্টাল অপারেশনস ও চালান প্রস্তুত", p: "৯২" },
      { num: "০৪", title: "অডিট চেকলিস্ট, সতর্কতা ও আইনি সুরক্ষা", p: "১৪৮" },
      { num: "০৫", title: "ব্যবহারিক কেস স্টাডি ও নমুনা ড্রাফটস", p: "১৯৫" },
    ];

    let currentY = 192;
    ctx.textAlign = "left";
    chapters.forEach((ch) => {
      ctx.fillStyle = "#243FBA";
      ctx.font = "700 12px Inter, sans-serif";
      ctx.fillText(`অধ্যায় ${ch.num}`, 54, currentY);

      ctx.fillStyle = "#181D26";
      ctx.font = "600 13px Inter, sans-serif";
      ctx.fillText(ch.title, 54, currentY + 18);

      ctx.fillStyle = "#C59028";
      ctx.font = "700 12px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`পৃষ্ঠা ${ch.p}`, 455, currentY + 18);
      ctx.textAlign = "left";

      ctx.strokeStyle = "#E1E4F2";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(54, currentY + 34);
      ctx.lineTo(455, currentY + 34);
      ctx.stroke();
      ctx.setLineDash([]);

      currentY += 56;
    });

    ctx.fillStyle = "#596775";
    ctx.font = "500 11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("যাচাইকৃত সংস্করণ • বিজনেস কমপ্লায়েন্স পার্টনার", 256, 626);
    ctx.fillStyle = "#C59028";
    ctx.font = "700 11px Inter, sans-serif";
    ctx.fillText("OFFICIAL VERIFIED PRACTICE COMPENDIUM", 256, 646);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function BookPreview3D({ book }: BookPreview3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetSideRef = useRef<"front" | "back">("front");
  const resetSignalRef = useRef(0);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const [webglSupported, setWebglSupported] = useState(true);

  const requestRenderRef = useRef<(() => void) | null>(null);

  const flipToSide = (side: "front" | "back") => {
    targetSideRef.current = side;
    setActiveSide(side);
    requestRenderRef.current?.();
  };

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      isOpenRef.current = next;
      if (next) {
        targetSideRef.current = "front";
        setActiveSide("front");
      }
      requestRenderRef.current?.();
      return next;
    });
  };

  const resetView = () => {
    targetSideRef.current = "front";
    resetSignalRef.current += 1;
    setActiveSide("front");
    setIsOpen(false);
    isOpenRef.current = false;
    requestRenderRef.current?.();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      const probe = document.createElement("canvas");
      if (!probe.getContext("webgl2") && !probe.getContext("webgl")) {
        setWebglSupported(false);
        return;
      }
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const isSoftwareGl = detectSoftwareWebGL(renderer);
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 380;

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.45, 5.1);
    camera.lookAt(0, 0, 0);

    let envResources: RoomEnvironmentResources | null = null;
    try {
      envResources = createRoomEnvironmentTexture(renderer);
      scene.environment = envResources.envMap;
    } catch {
      envResources = null;
    }

    scene.add(new THREE.HemisphereLight(0xf2eff8, 0x261d3a, 0.95));
    const key = new THREE.DirectionalLight(0xfff5e4, 1.5);
    key.position.set(3.5, 5.5, 4);
    scene.add(key);

    const bookGroup = new THREE.Group();
    scene.add(bookGroup);

    const shadowTex = createContactShadowTexture();
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 2.2),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.58,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.42;
    scene.add(shadow);

    const bookW = 1.75;
    const bookH = 2.48;
    const bookD = 0.28;

    const frontTex = createFrontCoverTexture(book, null);
    const backTex = createBackCoverTexture(book);

    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTex,
      roughness: 0.36,
      metalness: 0.12,
    });
    const backMat = new THREE.MeshStandardMaterial({
      map: backTex,
      roughness: 0.4,
      metalness: 0.1,
    });
    const spineMat = new THREE.MeshStandardMaterial({
      color: book.coverPalette.spineHex,
      roughness: 0.38,
      metalness: 0.16,
    });
    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xf7f2e7,
      roughness: 0.85,
      metalness: 0,
    });

    const insideSpreadTex = createInsideSpreadTexture(book);
    const insidePageMat = new THREE.MeshStandardMaterial({
      map: insideSpreadTex,
      roughness: 0.76,
      metalness: 0.02,
    });

    // Hinged front cover pivot along the spine line
    const frontCoverPivot = new THREE.Group();
    frontCoverPivot.position.set(-bookW / 2 + 0.018, 0, bookD / 2);
    bookGroup.add(frontCoverPivot);

    const frontBoard = new THREE.Mesh(
      new THREE.BoxGeometry(bookW, bookH, 0.032),
      [spineMat, spineMat, spineMat, spineMat, frontMat, insidePageMat],
    );
    frontBoard.position.set(bookW / 2 - 0.018, 0, -0.016);
    frontCoverPivot.add(frontBoard);

    const backBoard = new THREE.Mesh(
      new THREE.BoxGeometry(bookW, bookH, 0.032),
      [spineMat, spineMat, spineMat, spineMat, spineMat, backMat],
    );
    backBoard.position.z = -bookD / 2 + 0.016;
    bookGroup.add(backBoard);

    const spineWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, bookH, bookD),
      spineMat,
    );
    spineWall.position.x = -bookW / 2 + 0.018;
    bookGroup.add(spineWall);

    // Book block: on +Z face, display the inside spread so opening cover reveals page 1
    const pages = new THREE.Mesh(
      new THREE.BoxGeometry(bookW - 0.09, bookH - 0.09, bookD - 0.068),
      [pagesMat, pagesMat, pagesMat, pagesMat, insidePageMat, pagesMat],
    );
    pages.position.x = 0.018;
    bookGroup.add(pages);

    // Silk bookmark ribbon draped from top
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xc59028,
      roughness: 0.35,
      metalness: 0.45,
    });
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.65, 0.008),
      ribbonMat,
    );
    ribbon.position.set(0.12, bookH / 2 - 0.15, bookD / 2 - 0.02);
    ribbon.rotation.z = -0.08;
    bookGroup.add(ribbon);

    let cancelled = false;
    const coverAsset = resolveBookCoverAsset(book.slug, book.categorySlug);
    const coverImg = new window.Image();
    coverImg.crossOrigin = "anonymous";
    coverImg.onload = () => {
      if (cancelled) return;
      const upgraded = createFrontCoverTexture(book, null, coverImg);
      const oldMap = frontMat.map;
      frontMat.map = upgraded;
      frontMat.needsUpdate = true;
      oldMap?.dispose();
      renderer.render(scene, camera);
    };
    coverImg.src = coverAsset.publicPath;

    const logoImg = new window.Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.onload = () => {
      if (cancelled || (coverImg.complete && coverImg.naturalWidth > 0)) return;
      const upgraded = createFrontCoverTexture(book, logoImg, null);
      const oldMap = frontMat.map;
      frontMat.map = upgraded;
      frontMat.needsUpdate = true;
      oldMap?.dispose();
      renderer.render(scene, camera);
    };
    logoImg.src = "/brand/bcp-master-logo.png";

    let isDragging = false;
    let prevX = 0;
    let dragOffsetY = 0;
    let currentRotY = -0.32;
    let lastResetSignal = resetSignalRef.current;

    const timer = createDeltaTimer();
    let isVisible = true;
    let isTabActive = !document.hidden;
    let contextLost = false;
    let rafId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let cancelFence: (() => void) | null = null;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      renderer.domElement.setPointerCapture?.(e.pointerId);
      requestRender();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      dragOffsetY = THREE.MathUtils.clamp(dragOffsetY + dx * 0.01, -1.2, 1.2);
      requestRender();
    };
    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      requestRender();
    };

    const drawFrame = (): boolean => {
      if (resetSignalRef.current !== lastResetSignal) {
        lastResetSignal = resetSignalRef.current;
        dragOffsetY = 0;
      }

      const { delta, elapsed } = timer.step();
      const baseAngle =
        targetSideRef.current === "front" ? -0.32 : Math.PI - 0.32;

      if (!isDragging && !prefersReducedMotion && !isSoftwareGl) {
        dragOffsetY = THREE.MathUtils.damp(dragOffsetY, 0, 3.2, delta);
      } else if (!isDragging && isSoftwareGl && !prefersReducedMotion) {
        dragOffsetY = THREE.MathUtils.damp(
          dragOffsetY,
          0,
          6,
          Math.max(delta, 0.03),
        );
      }

      const desiredY =
        baseAngle +
        dragOffsetY +
        (prefersReducedMotion || isSoftwareGl ? 0 : Math.sin(elapsed * 0.7) * 0.06);

      if (prefersReducedMotion) {
        currentRotY = desiredY;
      } else if (isSoftwareGl) {
        currentRotY = THREE.MathUtils.damp(
          currentRotY,
          desiredY,
          10,
          Math.max(delta, 0.03),
        );
      } else {
        currentRotY = THREE.MathUtils.damp(currentRotY, desiredY, 7.5, delta);
      }

      bookGroup.rotation.y = currentRotY;
      bookGroup.rotation.x = 0.06;

      const targetCoverAngle = isOpenRef.current ? -Math.PI * 0.72 : 0;
      frontCoverPivot.rotation.y = prefersReducedMotion
        ? targetCoverAngle
        : THREE.MathUtils.damp(
            frontCoverPivot.rotation.y,
            targetCoverAngle,
            isSoftwareGl ? 10 : 6.5,
            isSoftwareGl ? Math.max(delta, 0.03) : delta,
          );

      const targetBookX = isOpenRef.current ? 0.38 : 0;
      bookGroup.position.x = prefersReducedMotion
        ? targetBookX
        : THREE.MathUtils.damp(
            bookGroup.position.x,
            targetBookX,
            isSoftwareGl ? 10 : 6.5,
            isSoftwareGl ? Math.max(delta, 0.03) : delta,
          );

      renderer.render(scene, camera);

      if (prefersReducedMotion) return false;
      if (isSoftwareGl) {
        return (
          isDragging ||
          Math.abs(currentRotY - desiredY) > 0.004 ||
          Math.abs(dragOffsetY) > 0.004 ||
          Math.abs(frontCoverPivot.rotation.y - targetCoverAngle) > 0.004 ||
          Math.abs(bookGroup.position.x - targetBookX) > 0.003
        );
      }
      return isVisible && isTabActive;
    };

    const requestRender = () => {
      if (cancelled || contextLost || !isVisible || !isTabActive) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      rafId = window.requestAnimationFrame(() => {
        if (cancelled) return;
        renderDirty = false;
        const shouldContinue = drawFrame();
        const finishFrame = () => {
          renderBusy = false;
          if (cancelled) return;
          if (renderDirty || shouldContinue) {
            requestRender();
          }
        };
        if (isSoftwareGl) {
          cancelFence?.();
          cancelFence = awaitWebGLFrameFence(renderer, finishFrame, 80);
        } else {
          finishFrame();
        }
      });
    };

    requestRenderRef.current = requestRender;

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);

    const stopResize = createResizeObserver(container, (newW, newH) => {
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      requestRender();
    });

    const stopContextLoss = attachContextLossRecovery(
      renderer.domElement,
      () => {
        contextLost = true;
        setWebglSupported(false);
      },
      () => {
        contextLost = false;
        setWebglSupported(true);
        requestRender();
      },
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const nextVisible = entries.some((entry) => entry.isIntersecting);
        isVisible = nextVisible;
        if (nextVisible) requestRender();
      },
      { threshold: 0.1 },
    );
    observer.observe(container);

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
      if (isTabActive) {
        timer.step();
        requestRender();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!isSoftwareGl) {
      try {
        renderer.compile(scene, camera);
      } catch {
        // Non-fatal shader warmup fallback
      }
    }

    requestRender();

    return () => {
      cancelled = true;
      requestRenderRef.current = null;
      window.cancelAnimationFrame(rafId);
      cancelFence?.();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      stopResize();
      stopContextLoss();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      disposeObject3D(scene);
      disposeRoomEnvironment(envResources);
      renderer.dispose();
    };
  }, [book]);

  return (
    <div
      data-testid="book-preview-3d"
      data-webgl-state={webglSupported ? "ready" : "fallback"}
      data-book-open={String(isOpen)}
      data-active-side={activeSide}
      className="rounded-[18px] border border-border-subtle bg-gradient-to-b from-surface-lavender via-white to-surface-lavender/60 overflow-hidden shadow-sm"
    >
      {webglSupported ? (
        <div
          ref={containerRef}
          role="img"
          aria-label={`${book.titleBn} ৩ডি প্রচ্ছদ প্রিভিউ`}
          className="w-full h-[320px] sm:h-[360px] cursor-grab active:cursor-grabbing select-none"
        />
      ) : (
        <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[320px]">
          <div className="relative w-48 aspect-[3/4] rounded-e-[12px] rounded-s-[4px] overflow-hidden shadow-lg border border-[#B8BBFF]/60">
            <NextImage
              src={resolveBookCoverAsset(book.slug, book.categorySlug).publicPath}
              alt={resolveBookCoverAsset(book.slug, book.categorySlug).altBn}
              width={720}
              height={960}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs font-semibold text-[#596775]">
            {book.availabilityState === "PUBLISHED_PRICED"
              ? "প্রকাশিত সংস্করণ প্রচ্ছদ"
              : "প্রস্তাবিত কনসেপ্ট প্রচ্ছদ · প্রকাশনা আসন্ন"}
          </p>
        </div>
      )}

      <div className="px-4 py-3 border-t border-border-subtle bg-white flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-muted">
          ড্র্যাগ করে প্রচ্ছদ ঘোরান
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={toggleOpen}
            aria-pressed={isOpen}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold border transition-colors cursor-pointer ${
              isOpen
                ? "bg-[#C59028] text-[#081838] border-[#C59028] font-bold shadow-xs"
                : "bg-surface-lavender text-text-primary border-border-subtle hover:bg-surface-lavender-muted"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isOpen ? "বই বন্ধ করুন" : "বই খুলুন"}</span>
          </button>
          <button
            type="button"
            onClick={() => flipToSide("front")}
            aria-pressed={activeSide === "front"}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-xs font-semibold border transition-colors cursor-pointer ${
              activeSide === "front"
                ? "bg-action-primary text-white border-action-primary"
                : "bg-surface-lavender text-text-primary border-border-subtle hover:bg-surface-lavender-muted"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>সামনের প্রচ্ছদ</span>
          </button>
          <button
            type="button"
            onClick={() => flipToSide("back")}
            aria-pressed={activeSide === "back"}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-xs font-semibold border transition-colors cursor-pointer ${
              activeSide === "back"
                ? "bg-action-primary text-white border-action-primary"
                : "bg-surface-lavender text-text-primary border-border-subtle hover:bg-surface-lavender-muted"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>পিছনের প্রচ্ছদ</span>
          </button>
          <button
            type="button"
            onClick={resetView}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-xs font-semibold border border-border-subtle bg-white text-text-accent hover:bg-surface-lavender transition-colors cursor-pointer"
          >
            রিসেট ভিউ
          </button>
        </div>
      </div>
    </div>
  );
}

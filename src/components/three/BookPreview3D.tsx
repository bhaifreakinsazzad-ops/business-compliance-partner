"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCcw, RotateCw } from "lucide-react";
import type { PublicBookPreview } from "@/types/domain";
import {
  createContactShadowTexture,
  createRoomEnvironmentTexture,
  detectSoftwareWebGL,
  disposeObject3D,
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
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const { coverHex, accentHex, textHex, spineHex } = book.coverPalette;
    ctx.fillStyle = coverHex;
    ctx.fillRect(0, 0, 512, 720);

    // Subtle spine crease gradient
    const crease = ctx.createLinearGradient(0, 0, 48, 0);
    crease.addColorStop(0, spineHex);
    crease.addColorStop(0.5, "rgba(0,0,0,0.28)");
    crease.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = crease;
    ctx.fillRect(0, 0, 48, 720);

    // Gold editorial border frame
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 440, 648);

    // Top badge bar
    ctx.fillStyle = accentHex;
    ctx.font = "700 18px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(book.categoryNameEn.toUpperCase(), 256, 72);

    ctx.fillStyle = accentHex;
    ctx.fillRect(156, 106, 200, 2);

    // Title
    ctx.fillStyle = textHex;
    ctx.font = "700 32px Georgia, serif";
    const nextY = wrapCanvasText(ctx, book.titleEn, 256, 148, 380, 42);

    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = "500 18px Inter, sans-serif";
    wrapCanvasText(
      ctx,
      "Upcoming Client-Approved Compliance Edition",
      256,
      Math.max(nextY + 18, 320),
      360,
      26,
    );

    // Untouched official circular badge at lower center
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
    ctx.fillText("UPCOMING EDITION PREVIEW", 64, 72);

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
    ctx.fillText("Status: Client Approval Pending", 64, 595);
    ctx.fillText("Business Compliance Partner • Bangladesh", 64, 624);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function BookPreview3D({ book }: BookPreview3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetSideRef = useRef<"front" | "back">("front");
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [webglSupported, setWebglSupported] = useState(true);

  const flipToSide = (side: "front" | "back") => {
    targetSideRef.current = side;
    setActiveSide(side);
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

    let envResources: ReturnType<typeof createRoomEnvironmentTexture> | null =
      null;
    if (!isSoftwareGl) {
      try {
        envResources = createRoomEnvironmentTexture(renderer);
        scene.environment = envResources.envMap;
      } catch {
        envResources = null;
      }
    }

    scene.add(new THREE.HemisphereLight(0xf2eff8, 0x261d3a, 0.95));
    const key = new THREE.DirectionalLight(0xfff5e4, 1.5);
    key.position.set(3.5, 5.5, 4);
    scene.add(key);

    const bookGroup = new THREE.Group();
    scene.add(bookGroup);

    // Contact grounding shadow
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

    // Front board
    const frontBoard = new THREE.Mesh(
      new THREE.BoxGeometry(bookW, bookH, 0.032),
      [spineMat, spineMat, spineMat, spineMat, frontMat, spineMat],
    );
    frontBoard.position.z = bookD / 2 - 0.016;
    bookGroup.add(frontBoard);

    // Back board
    const backBoard = new THREE.Mesh(
      new THREE.BoxGeometry(bookW, bookH, 0.032),
      [spineMat, spineMat, spineMat, spineMat, spineMat, backMat],
    );
    backBoard.position.z = -bookD / 2 + 0.016;
    bookGroup.add(backBoard);

    // Left spine wall
    const spineWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, bookH, bookD),
      spineMat,
    );
    spineWall.position.x = -bookW / 2 + 0.018;
    bookGroup.add(spineWall);

    // Inset cream pages block
    const pages = new THREE.Mesh(
      new THREE.BoxGeometry(bookW - 0.09, bookH - 0.09, bookD - 0.068),
      pagesMat,
    );
    pages.position.x = 0.018;
    bookGroup.add(pages);

    let cancelled = false;
    const logoImg = new window.Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.onload = () => {
      if (cancelled) return;
      const upgraded = createFrontCoverTexture(book, logoImg);
      const oldMap = frontMat.map;
      frontMat.map = upgraded;
      frontMat.needsUpdate = true;
      oldMap?.dispose();
      renderer.render(scene, camera);
    };
    logoImg.src = "/brand/bcp-master-logo.png";

    // Pointer drag rotation
    let isDragging = false;
    let prevX = 0;
    let dragOffsetY = 0;
    let currentRotY = -0.32;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      dragOffsetY = THREE.MathUtils.clamp(dragOffsetY + dx * 0.01, -1.2, 1.2);
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);

    const handleResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (!newW || !newH) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      renderer.render(scene, camera);
    };
    window.addEventListener("resize", handleResize);

    let isVisible = true;
    let isTabActive = !document.hidden;
    let rafId = 0;
    let timeoutId = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(container);

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const clock = new THREE.Clock();

    const renderFrame = () => {
      if (cancelled) return;
      if (!isVisible || !isTabActive) {
        scheduleNext();
        return;
      }

      const elapsed = clock.getElapsedTime();
      const baseAngle =
        targetSideRef.current === "front" ? -0.32 : Math.PI - 0.32;

      if (!isDragging && !prefersReducedMotion) {
        dragOffsetY *= 0.94;
      }

      const desiredY = baseAngle + dragOffsetY + (prefersReducedMotion ? 0 : Math.sin(elapsed * 0.7) * 0.06);
      currentRotY += (desiredY - currentRotY) * (prefersReducedMotion ? 1 : 0.1);
      bookGroup.rotation.y = currentRotY;
      bookGroup.rotation.x = 0.06;

      renderer.render(scene, camera);
      scheduleNext();
    };

    const scheduleNext = () => {
      if (cancelled) return;
      if (isSoftwareGl) {
        timeoutId = window.setTimeout(() => {
          rafId = window.requestAnimationFrame(renderFrame);
        }, 48);
      } else {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      disposeObject3D(scene);
      if (envResources) {
        envResources.envMap.dispose();
        envResources.envScene.dispose();
        envResources.pmrem.dispose();
      }
      renderer.dispose();
    };
  }, [book]);

  return (
    <div className="rounded-[18px] border border-[#D4CCE3] bg-gradient-to-b from-[#F2EFF8] via-white to-[#F2EFF8]/60 overflow-hidden shadow-sm">
      {webglSupported ? (
        <div
          ref={containerRef}
          role="img"
          aria-label={`${book.titleBn} ৩ডি প্রচ্ছদ প্রিভিউ`}
          className="w-full h-[320px] sm:h-[360px] cursor-grab active:cursor-grabbing select-none"
        />
      ) : (
        <div className="p-8 flex items-center justify-center min-h-[320px]">
          <div
            className="w-52 h-72 rounded-[12px] p-5 flex flex-col justify-between shadow-lg border border-[#C59028]"
            style={{
              backgroundColor: book.coverPalette.coverHex,
              color: book.coverPalette.textHex,
            }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#DFB15B]">
              {book.categoryNameEn}
            </p>
            <p className="font-editorial text-lg font-bold leading-snug">
              {book.titleBn}
            </p>
            <p className="text-[11px] opacity-80">প্রকাশনা আসন্ন</p>
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-[#D4CCE3] bg-white flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#596775]">
          ড্র্যাগ করে প্রচ্ছদ ঘোরান
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => flipToSide("front")}
            aria-pressed={activeSide === "front"}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-xs font-semibold border transition-colors cursor-pointer ${
              activeSide === "front"
                ? "bg-[#51406F] text-white border-[#51406F]"
                : "bg-[#F2EFF8] text-[#081838] border-[#D4CCE3] hover:bg-[#DDD6EB]"
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
                ? "bg-[#51406F] text-white border-[#51406F]"
                : "bg-[#F2EFF8] text-[#081838] border-[#D4CCE3] hover:bg-[#DDD6EB]"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>পিছনের প্রচ্ছদ</span>
          </button>
        </div>
      </div>
    </div>
  );
}

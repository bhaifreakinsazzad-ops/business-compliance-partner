"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import {
  attachContextLossRecovery,
  createAmbientLavenderShaderBackdrop,
  createBookSpineTexture,
  createContactShadowTexture,
  createDocumentCardTexture,
  createLaptopScreenTexture,
  createResizeObserver,
  createRoomEnvironmentTexture,
  detectSoftwareWebGL,
  disposeObject3D,
  disposeRoomEnvironment,
  type RoomEnvironmentResources,
} from "@/components/three/threeUtils";

interface HeroKnowledgeStudio3DProps {
  activeSlideIndex: number;
  logoAssetPath: string;
  brandName: string;
}

const HERO_BOOK_SPINES = [
  { title: "E-commerce & DBID", bg: "#1B2E59", accent: "#C59028" },
  { title: "e-GP & Tender", bg: "#51406F", accent: "#DFB15B" },
  { title: "RJSC & Company Law", bg: "#0E224A", accent: "#C59028" },
  { title: "VAT & Mushak 9.1", bg: "#3F315A", accent: "#DFB15B" },
  { title: "Income Tax Guide", bg: "#081838", accent: "#C59028" },
];

export function HeroKnowledgeStudio3D({
  activeSlideIndex,
  logoAssetPath,
  brandName,
}: HeroKnowledgeStudio3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideTargetRef = useRef<number>(activeSlideIndex);
  const [webglReady, setWebglReady] = useState(true);

  useEffect(() => {
    slideTargetRef.current = activeSlideIndex;
  }, [activeSlideIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      const probeCanvas = document.createElement("canvas");
      const glProbe =
        probeCanvas.getContext("webgl2") || probeCanvas.getContext("webgl");
      if (!glProbe) {
        setWebglReady(false);
        return;
      }

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglReady(false);
      return;
    }

    const isSoftwareGl = detectSoftwareWebGL(renderer);
    const width = container.clientWidth || 460;
    const height = container.clientHeight || 280;

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
    );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0.3, 1.85, 6.2);
    camera.lookAt(0, 0.35, 0);

    // Environment IBL (skipped on software WebGL for steady responsiveness)
    let envResources: RoomEnvironmentResources | null = null;
    if (!isSoftwareGl) {
      try {
        envResources = createRoomEnvironmentTexture(renderer);
        scene.environment = envResources.envMap;
      } catch {
        envResources = null;
      }
    }

    // Subtle Executive Lavender shader backdrop
    const shaderBackdrop = !isSoftwareGl
      ? createAmbientLavenderShaderBackdrop(9, 5)
      : null;
    if (shaderBackdrop) {
      scene.add(shaderBackdrop.mesh);
    }

    // Studio 3-point Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xf2eff8, 0x2f2546, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ea, 1.55);
    keyLight.position.set(4.5, 6.5, 4.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xddd6eb, 0.85);
    fillLight.position.set(-5.0, 2.5, 3.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc59028, 0.7);
    rimLight.position.set(0.5, 3.0, -4.5);
    scene.add(rimLight);

    const studioRoot = new THREE.Group();
    studioRoot.position.set(0, -0.35, 0);
    scene.add(studioRoot);

    // 1. Studio Plinth Base
    const plinthGeo = new THREE.CylinderGeometry(2.65, 2.75, 0.14, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xf2eff8,
      roughness: 0.45,
      metalness: 0.08,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.set(0, -0.08, 0);
    studioRoot.add(plinth);

    const plinthTrimGeo = new THREE.TorusGeometry(2.66, 0.02, 12, 72);
    const plinthTrimMat = new THREE.MeshStandardMaterial({
      color: 0xc59028,
      roughness: 0.25,
      metalness: 0.8,
    });
    const plinthTrim = new THREE.Mesh(plinthTrimGeo, plinthTrimMat);
    plinthTrim.rotation.x = Math.PI / 2;
    plinthTrim.position.y = -0.01;
    studioRoot.add(plinthTrim);

    // Soft radial contact shadow plane
    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 2.4),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0.05, 0.002, 0.05);
    studioRoot.add(shadowPlane);

    // 2. Executive Laptop Assembly (Left-Center)
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(-0.72, 0.02, 0.2);
    laptopGroup.rotation.y = 0.22;
    studioRoot.add(laptopGroup);

    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0xd8dce4,
      roughness: 0.28,
      metalness: 0.72,
    });
    const darkDeckMat = new THREE.MeshStandardMaterial({
      color: 0x161d2e,
      roughness: 0.55,
      metalness: 0.25,
    });

    const baseDeck = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.06, 1.18),
      aluminumMat,
    );
    baseDeck.position.y = 0.03;
    laptopGroup.add(baseDeck);

    const keyWell = new THREE.Mesh(
      new THREE.BoxGeometry(1.48, 0.015, 0.56),
      darkDeckMat,
    );
    keyWell.position.set(0, 0.062, -0.14);
    laptopGroup.add(keyWell);

    const trackpad = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.008, 0.34),
      new THREE.MeshStandardMaterial({
        color: 0xc2c8d4,
        roughness: 0.35,
        metalness: 0.5,
      }),
    );
    trackpad.position.set(0, 0.061, 0.34);
    laptopGroup.add(trackpad);

    // Laptop hinged display
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 0.06, -0.56);
    lidPivot.rotation.x = -0.26;
    laptopGroup.add(lidPivot);

    const lidShell = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 1.12, 0.045),
      aluminumMat,
    );
    lidShell.position.set(0, 0.56, 0);
    lidPivot.add(lidShell);

    const bezelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.66, 1.04, 0.02),
      darkDeckMat,
    );
    bezelMesh.position.set(0, 0.56, 0.02);
    lidPivot.add(bezelMesh);

    const screenTexture = createLaptopScreenTexture(null);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      roughness: 0.22,
      metalness: 0.05,
      emissive: new THREE.Color(0x2a1f45),
      emissiveMap: screenTexture,
      emissiveIntensity: 0.42,
    });
    const screenPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.56, 0.95),
      screenMat,
    );
    screenPlane.position.set(0, 0.56, 0.032);
    lidPivot.add(screenPlane);

    // Load untouched circular official BCP logo onto laptop screen texture once ready
    let cancelled = false;
    if (logoAssetPath) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        const upgraded = createLaptopScreenTexture(img);
        const oldMap = screenMat.map;
        screenMat.map = upgraded;
        screenMat.emissiveMap = upgraded;
        screenMat.needsUpdate = true;
        oldMap?.dispose();
        renderer.render(scene, camera);
      };
      img.src = logoAssetPath;
    }

    // 3. Stacked Compliance Hardcover Books Assembly (Right)
    const booksGroup = new THREE.Group();
    booksGroup.position.set(1.12, 0.02, -0.05);
    booksGroup.rotation.y = -0.26;
    studioRoot.add(booksGroup);

    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xf7f2e7,
      roughness: 0.82,
      metalness: 0.0,
    });

    HERO_BOOK_SPINES.forEach((spec, idx) => {
      const bookHolder = new THREE.Group();
      const yOffset = idx * 0.215;
      bookHolder.position.set(
        (idx % 2 === 0 ? 1 : -1) * 0.025,
        yOffset,
        (idx - 2) * 0.012,
      );
      bookHolder.rotation.y = (idx - 2) * 0.035;

      const w = 1.48 - idx * 0.02;
      const h = 0.19;
      const d = 1.02 - idx * 0.015;

      const coverMat = new THREE.MeshStandardMaterial({
        color: spec.bg,
        roughness: 0.42,
        metalness: 0.14,
      });

      const spineTex = createBookSpineTexture({
        title: spec.title,
        bgHex: spec.bg,
        accentHex: spec.accent,
      });
      const spineMat = new THREE.MeshStandardMaterial({
        map: spineTex,
        roughness: 0.38,
        metalness: 0.18,
      });

      const boardTop = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.024, d),
        coverMat,
      );
      boardTop.position.y = h - 0.012;
      bookHolder.add(boardTop);

      const boardBottom = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.024, d),
        coverMat,
      );
      boardBottom.position.y = 0.012;
      bookHolder.add(boardBottom);

      const pages = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.06, h - 0.048, d - 0.06),
        pagesMat,
      );
      pages.position.set(0.015, h / 2, -0.015);
      bookHolder.add(pages);

      const spineFace = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 0.04),
        spineMat,
      );
      spineFace.position.set(0, h / 2, d / 2 - 0.015);
      bookHolder.add(spineFace);

      booksGroup.add(bookHolder);
    });

    // 4. Floating Compliance Checklist Panels (Background framing)
    const panelsGroup = new THREE.Group();
    studioRoot.add(panelsGroup);

    const cardSpecs = [
      {
        title: "Income Tax",
        subtitle: "Courses & Returns",
        accentHex: "#51406F",
        pos: [-1.85, 1.15, -0.82] as const,
        rot: 0.18,
      },
      {
        title: "VAT & Mushak",
        subtitle: "BIN & 9.1 Filing",
        accentHex: "#00865A",
        pos: [0.22, 1.52, -0.96] as const,
        rot: -0.08,
      },
      {
        title: "e-GP & RJSC",
        subtitle: "Licensing & Books",
        accentHex: "#C59028",
        pos: [1.95, 1.28, -0.78] as const,
        rot: -0.22,
      },
    ];

    const floatingPanels: THREE.Mesh[] = [];
    cardSpecs.forEach((card) => {
      const tex = createDocumentCardTexture(card);
      const panelMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.34, 0.025),
        new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.35,
          metalness: 0.06,
        }),
      );
      panelMesh.position.set(card.pos[0], card.pos[1], card.pos[2]);
      panelMesh.rotation.y = card.rot;
      panelsGroup.add(panelMesh);
      floatingPanels.push(panelMesh);
    });

    // Pointer parallax state
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let currentYaw = 0;
    let currentPitch = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      pointerTargetX = THREE.MathUtils.clamp(nx * 0.24, -0.2, 0.2);
      pointerTargetY = THREE.MathUtils.clamp(ny * 0.1, -0.08, 0.08);
    };

    const handlePointerLeave = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave);

    const stopResize = createResizeObserver(container, (newW, newH) => {
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      renderer.render(scene, camera);
    });

    let isVisible = true;
    let isTabActive = !document.hidden;
    let contextLost = false;
    let rafId = 0;
    let timeoutId = 0;

    const stopContextLoss = attachContextLossRecovery(
      renderer.domElement,
      () => {
        contextLost = true;
        setWebglReady(false);
      },
      () => {
        contextLost = false;
        setWebglReady(true);
        renderer.render(scene, camera);
      },
    );

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

    const tick = () => {
      if (cancelled) return;

      const renderFrame = () => {
        if (contextLost || !isVisible || !isTabActive) {
          scheduleNext();
          return;
        }

        const elapsed = clock.getElapsedTime();
        const slideIdx = slideTargetRef.current;

        if (shaderBackdrop) {
          shaderBackdrop.uniforms.uTime.value = elapsed;
        }

        const slideYawOffset =
          slideIdx === 4 ? -0.14 : slideIdx === 1 ? 0.06 : 0;

        if (!prefersReducedMotion) {
          currentYaw += (pointerTargetX + slideYawOffset - currentYaw) * 0.06;
          currentPitch += (pointerTargetY - currentPitch) * 0.06;

          studioRoot.rotation.y = currentYaw + Math.sin(elapsed * 0.45) * 0.04;
          studioRoot.rotation.x = currentPitch;

          floatingPanels.forEach((panel, idx) => {
            const baseY = cardSpecs[idx]?.pos[1] ?? 1.2;
            panel.position.y =
              baseY + Math.sin(elapsed * 1.1 + idx * 1.4) * 0.045;
          });
        } else {
          studioRoot.rotation.y = slideYawOffset;
        }

        renderer.render(scene, camera);
        scheduleNext();
      };

      const scheduleNext = () => {
        if (cancelled || prefersReducedMotion) return;
        if (isSoftwareGl) {
          timeoutId = window.setTimeout(() => {
            rafId = window.requestAnimationFrame(renderFrame);
          }, 48);
        } else {
          rafId = window.requestAnimationFrame(renderFrame);
        }
      };

      renderFrame();
    };

    tick();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      stopResize();
      stopContextLoss();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      disposeObject3D(scene);
      disposeRoomEnvironment(envResources);
      renderer.dispose();
    };
  }, [logoAssetPath]);

  if (!webglReady) {
    return (
      <div className="w-full h-[220px] sm:h-[260px] rounded-[16px] border border-[#D4CCE3] bg-gradient-to-br from-white via-[#F2EFF8] to-[#DDD6EB] p-5 flex items-center justify-between gap-4 shadow-sm">
        <div className="space-y-2.5">
          {logoAssetPath ? (
            <Image
              src={logoAssetPath}
              alt={`${brandName} official badge`}
              width={54}
              height={54}
              referrerPolicy="no-referrer"
              className="rounded-full border border-[#C59028]/60 object-contain bg-white"
            />
          ) : null}
          <p className="text-sm font-bold text-[#081838]">
            প্রশিক্ষণ, সেবা ও প্রকাশনা
          </p>
          <p className="text-xs text-[#596775]">
            Tax · VAT & Mushak · e-GP · RJSC · E-commerce
          </p>
        </div>
        <div className="space-y-1.5 w-40 shrink-0" aria-hidden="true">
          {HERO_BOOK_SPINES.map((book) => (
            <div
              key={book.title}
              className="px-3 py-1.5 rounded-[6px] text-[10px] font-semibold text-white border-l-2 border-[#C59028] shadow-xs truncate"
              style={{ backgroundColor: book.bg }}
            >
              {book.title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Business Compliance Partner ইন্টারেক্টিভ ৩ডি নলেজ স্টুডিও"
      className="w-full h-[220px] sm:h-[250px] lg:h-[290px] relative select-none"
    />
  );
}

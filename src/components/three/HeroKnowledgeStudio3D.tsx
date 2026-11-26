"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import {
  BookOpen,
  Compass,
  FileCheck2,
  Laptop,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import {
  attachContextLossRecovery,
  awaitWebGLFrameFence,
  createAmbientLavenderShaderBackdrop,
  createBookSpineTexture,
  createContactShadowTexture,
  createDeltaTimer,
  createDocumentCardTexture,
  createLaptopScreenTexture,
  createResizeObserver,
  createRoomEnvironmentTexture,
  detectSoftwareWebGL,
  disposeObject3D,
  disposeRoomEnvironment,
  resolveSlideYawOffset,
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

export type StudioViewPreset = "studio" | "laptop" | "books" | "cards";

interface PresetSpec {
  id: StudioViewPreset;
  labelBn: string;
  camPos: [number, number, number];
  lookAt: [number, number, number];
}

const STUDIO_PRESETS: PresetSpec[] = [
  {
    id: "studio",
    labelBn: "স্টুডিও",
    camPos: [0.3, 1.85, 6.2],
    lookAt: [0, 0.35, 0],
  },
  {
    id: "laptop",
    labelBn: "ডিজিটাল HQ",
    camPos: [-0.78, 1.15, 3.15],
    lookAt: [-0.68, 0.52, 0.1],
  },
  {
    id: "books",
    labelBn: "৫টি বইয়ের তাক",
    camPos: [1.35, 1.05, 3.2],
    lookAt: [1.05, 0.48, -0.05],
  },
  {
    id: "cards",
    labelBn: "কমপ্লায়েন্স কার্ডস",
    camPos: [0.0, 1.85, 4.25],
    lookAt: [0.08, 1.25, -0.8],
  },
];

// Pre-allocated math helpers at module scope (Three.js skill directive: zero GC in loop)
const _vecCamTarget = new THREE.Vector3();
const _vecLookTarget = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.35, 0);
const _raycaster = new THREE.Raycaster();
const _pointerCoords = new THREE.Vector2();

export function HeroKnowledgeStudio3D({
  activeSlideIndex,
  logoAssetPath,
  brandName,
}: HeroKnowledgeStudio3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideTargetRef = useRef<number>(activeSlideIndex);
  const [webglReady, setWebglReady] = useState(true);

  // Interactive UI State
  const [activePreset, setActivePreset] = useState<StudioViewPreset>("studio");
  const activePresetRef = useRef<StudioViewPreset>("studio");
  const [, setScreenMode] = useState(0);
  const screenModeRef = useRef(0);
  const [hoveredPrompt, setHoveredPrompt] = useState<string | null>(null);
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    slideTargetRef.current = activeSlideIndex;
    requestRenderRef.current?.();
  }, [activeSlideIndex]);

  const selectPreset = (preset: StudioViewPreset) => {
    setActivePreset(preset);
    activePresetRef.current = preset;
    requestRenderRef.current?.();
  };

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
    _currentLookAt.set(0, 0.35, 0);
    camera.lookAt(_currentLookAt);

    // Studio Environment IBL on all devices so metallic gold & slate reflections match
    let envResources: RoomEnvironmentResources | null = null;
    try {
      envResources = createRoomEnvironmentTexture(renderer);
      scene.environment = envResources.envMap;
    } catch {
      envResources = null;
    }

    // Lavender shader backdrop
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

    // Contact shadow plane
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

    // 2. Executive Laptop Assembly
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

    let currentLogoImg: HTMLImageElement | null = null;
    const initialScreenTex = createLaptopScreenTexture(null, 0);
    const screenMat = new THREE.MeshStandardMaterial({
      map: initialScreenTex,
      roughness: 0.22,
      metalness: 0.05,
      emissive: new THREE.Color(0x2a1f45),
      emissiveMap: initialScreenTex,
      emissiveIntensity: 0.42,
    });
    const screenPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.56, 0.95),
      screenMat,
    );
    screenPlane.position.set(0, 0.56, 0.032);
    lidPivot.add(screenPlane);

    // Hit proxy for laptop interaction
    const laptopHitGeo = new THREE.BoxGeometry(1.85, 1.25, 1.3);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const laptopHitProxy = new THREE.Mesh(laptopHitGeo, hitMat);
    laptopHitProxy.position.set(0, 0.55, 0);
    laptopHitProxy.userData = {
      kind: "laptop",
      label: "💻 BCP ডিজিটাল কমপ্লায়েন্স স্যুট (ক্লিক করে স্ক্রিন বদলান)",
    };
    laptopGroup.add(laptopHitProxy);

    let cancelled = false;
    if (logoAssetPath) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        currentLogoImg = img;
        const upgraded = createLaptopScreenTexture(img, screenModeRef.current);
        const oldMap = screenMat.map;
        screenMat.map = upgraded;
        screenMat.emissiveMap = upgraded;
        screenMat.needsUpdate = true;
        oldMap?.dispose();
        requestRenderRef.current?.();
      };
      img.src = logoAssetPath;
    }

    // 3. Stacked Books Assembly with dynamic pull-out slots
    const booksGroup = new THREE.Group();
    booksGroup.position.set(1.12, 0.02, -0.05);
    booksGroup.rotation.y = -0.26;
    studioRoot.add(booksGroup);

    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xf7f2e7,
      roughness: 0.82,
      metalness: 0.0,
    });

    interface BookController {
      group: THREE.Group;
      baseZ: number;
      targetZ: number;
      currentZ: number;
    }

    const bookControllers: BookController[] = [];
    const interactiveMeshes: THREE.Mesh[] = [laptopHitProxy];

    HERO_BOOK_SPINES.forEach((spec, idx) => {
      const bookHolder = new THREE.Group();
      const yOffset = idx * 0.215;
      const baseZ = (idx - 2) * 0.012;
      bookHolder.position.set(
        (idx % 2 === 0 ? 1 : -1) * 0.025,
        yOffset,
        baseZ,
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

      // Book hit proxy
      const bookHit = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        hitMat,
      );
      bookHit.position.set(0, h / 2, 0);
      bookHit.userData = {
        kind: "book",
        index: idx,
        title: spec.title,
        label: `📚 ${spec.title} (ক্লিক করে বের করুন)`,
      };
      bookHolder.add(bookHit);
      interactiveMeshes.push(bookHit);

      booksGroup.add(bookHolder);
      bookControllers.push({
        group: bookHolder,
        baseZ,
        targetZ: baseZ,
        currentZ: baseZ,
      });
    });

    // 4. Floating Compliance Checklist Panels
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
      panelMesh.userData = {
        kind: "card",
        title: card.title,
        label: `📋 ${card.title}: ${card.subtitle}`,
      };
      panelsGroup.add(panelMesh);
      floatingPanels.push(panelMesh);
      interactiveMeshes.push(panelMesh);
    });

    // Interaction State & Physics
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let currentYaw = 0;
    let currentPitch = 0;
    let manualOrbitAngle = 0;
    let dragVelocityX = 0;
    let isDragging = false;
    let prevDragX = 0;
    let totalDragDistance = 0;

    const timer = createDeltaTimer();
    let isVisible = true;
    let isTabActive = !document.hidden;
    let contextLost = false;
    let rafId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let cancelFence: (() => void) | null = null;
    const bookResetTimeouts = new Set<number>();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevDragX = e.clientX;
      totalDragDistance = 0;
      renderer.domElement.setPointerCapture?.(e.pointerId);
      requestRender();
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      if (isDragging) {
        const dx = e.clientX - prevDragX;
        prevDragX = e.clientX;
        dragVelocityX += dx * 0.004;
        totalDragDistance += Math.abs(dx);
      }

      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      pointerTargetX = THREE.MathUtils.clamp(nx * 0.24, -0.2, 0.2);
      pointerTargetY = THREE.MathUtils.clamp(ny * 0.1, -0.08, 0.08);

      // Raycasting for hover inspection
      _pointerCoords.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointerCoords.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_pointerCoords, camera);

      const hits = _raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0 && hits[0]?.object.userData?.label) {
        container.style.cursor = "pointer";
        setHoveredPrompt(hits[0].object.userData.label);
      } else {
        container.style.cursor = isDragging ? "grabbing" : "default";
        setHoveredPrompt(null);
      }

      if (!prefersReducedMotion) {
        requestRender();
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;

      if (totalDragDistance < 6) {
        const rect = container.getBoundingClientRect();
        _pointerCoords.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        _pointerCoords.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        _raycaster.setFromCamera(_pointerCoords, camera);

        const hits = _raycaster.intersectObjects(interactiveMeshes, false);
        if (hits.length > 0) {
          const hitData = hits[0]?.object.userData;
          if (hitData?.kind === "laptop") {
            const nextMode = (screenModeRef.current + 1) % 3;
            screenModeRef.current = nextMode;
            setScreenMode(nextMode);
            const upgraded = createLaptopScreenTexture(currentLogoImg, nextMode);
            const oldMap = screenMat.map;
            screenMat.map = upgraded;
            screenMat.emissiveMap = upgraded;
            screenMat.needsUpdate = true;
            oldMap?.dispose();
            requestRender();
          } else if (hitData?.kind === "book") {
            const idx = hitData.index as number;
            const ctrl = bookControllers[idx];
            if (ctrl) {
              const isExtended = ctrl.targetZ > ctrl.baseZ + 0.1;
              ctrl.targetZ = isExtended ? ctrl.baseZ : ctrl.baseZ + 0.32;
              requestRender();
              if (!isExtended) {
                const tid = window.setTimeout(() => {
                  bookResetTimeouts.delete(tid);
                  ctrl.targetZ = ctrl.baseZ;
                  requestRender();
                }, 2600);
                bookResetTimeouts.add(tid);
              }
            }
          } else if (hitData?.kind === "card") {
            selectPreset("cards");
          }
        }
      }
    };

    const handlePointerLeave = () => {
      isDragging = false;
      pointerTargetX = 0;
      pointerTargetY = 0;
      setHoveredPrompt(null);
      if (!prefersReducedMotion) {
        requestRender();
      }
    };

    const drawFrame = (): boolean => {
      const { delta, elapsed } = timer.step();
      const slideYawOffset = resolveSlideYawOffset(slideTargetRef.current);

      if (shaderBackdrop) {
        shaderBackdrop.uniforms.uTime.value = elapsed;
      }

      const presetKey = activePresetRef.current;
      const currentSpec =
        STUDIO_PRESETS.find((p) => p.id === presetKey) || STUDIO_PRESETS[0]!;
      _vecCamTarget.set(...currentSpec.camPos);
      _vecLookTarget.set(...currentSpec.lookAt);

      let keepAnimating = false;

      if (prefersReducedMotion || isSoftwareGl) {
        // Under software WebGL & reduced motion, converge swiftly or cleanly step
        if (prefersReducedMotion) {
          camera.position.copy(_vecCamTarget);
          _currentLookAt.copy(_vecLookTarget);
          camera.lookAt(_currentLookAt);
          studioRoot.rotation.y = slideYawOffset;
          studioRoot.rotation.x = 0;
          bookControllers.forEach((ctrl) => {
            ctrl.currentZ = ctrl.targetZ;
            ctrl.group.position.z = ctrl.currentZ;
          });
        } else {
          camera.position.lerp(_vecCamTarget, 0.25);
          _currentLookAt.lerp(_vecLookTarget, 0.25);
          camera.lookAt(_currentLookAt);
          dragVelocityX *= 0.84;
          manualOrbitAngle += dragVelocityX;
          currentYaw += (pointerTargetX + slideYawOffset - currentYaw) * 0.22;
          currentPitch += (pointerTargetY - currentPitch) * 0.22;
          studioRoot.rotation.y = manualOrbitAngle + currentYaw;
          studioRoot.rotation.x = currentPitch;

          bookControllers.forEach((ctrl) => {
            ctrl.currentZ = THREE.MathUtils.damp(
              ctrl.currentZ,
              ctrl.targetZ,
              10,
              Math.max(delta, 0.03),
            );
            ctrl.group.position.z = ctrl.currentZ;
            if (Math.abs(ctrl.currentZ - ctrl.targetZ) > 0.002) {
              keepAnimating = true;
            }
          });

          if (
            camera.position.distanceTo(_vecCamTarget) > 0.015 ||
            Math.abs(dragVelocityX) > 0.001 ||
            Math.abs(pointerTargetX + slideYawOffset - currentYaw) > 0.005 ||
            Math.abs(pointerTargetY - currentPitch) > 0.005 ||
            isDragging
          ) {
            keepAnimating = true;
          }
        }
      } else {
        camera.position.lerp(_vecCamTarget, 0.08);
        _currentLookAt.lerp(_vecLookTarget, 0.08);
        camera.lookAt(_currentLookAt);

        dragVelocityX *= 0.92;
        manualOrbitAngle += dragVelocityX;

        currentYaw += (pointerTargetX + slideYawOffset - currentYaw) * 0.06;
        currentPitch += (pointerTargetY - currentPitch) * 0.06;

        studioRoot.rotation.y =
          manualOrbitAngle + currentYaw + Math.sin(elapsed * 0.45) * 0.04;
        studioRoot.rotation.x = currentPitch;

        floatingPanels.forEach((panel, idx) => {
          const baseY = cardSpecs[idx]?.pos[1] ?? 1.2;
          panel.position.y =
            baseY + Math.sin(elapsed * 1.1 + idx * 1.4) * 0.045;
        });

        bookControllers.forEach((ctrl) => {
          ctrl.currentZ = THREE.MathUtils.damp(
            ctrl.currentZ,
            ctrl.targetZ,
            8.5,
            delta,
          );
          ctrl.group.position.z = ctrl.currentZ;
        });

        keepAnimating = isVisible && isTabActive;
      }

      renderer.render(scene, camera);
      return keepAnimating;
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
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointerleave", handlePointerLeave);

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
        setWebglReady(false);
      },
      () => {
        contextLost = false;
        setWebglReady(true);
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
      for (const tid of bookResetTimeouts) {
        window.clearTimeout(tid);
      }
      bookResetTimeouts.clear();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
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
      <div
        data-testid="hero-studio-3d"
        data-webgl-state="fallback"
        className="w-full h-[220px] sm:h-[260px] rounded-[16px] border border-[#D4CCE3] bg-gradient-to-br from-white via-[#F2EFF8] to-[#DDD6EB] p-5 flex items-center justify-between gap-4 shadow-sm"
      >
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
              className="px-3 py-1.5 rounded-[6px] text-[10px] font-semibold text-white border border-[#C59028]/50 shadow-xs truncate"
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
      data-testid="hero-studio-3d"
      data-webgl-state="ready"
      data-active-preset={activePreset}
      className="w-full relative select-none rounded-[18px] overflow-hidden group"
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        role="img"
        aria-label="Business Compliance Partner ইন্টারেক্টিভ ৩ডি নলেজ স্টুডিও"
        className="w-full h-[240px] sm:h-[280px] lg:h-[310px] relative cursor-grab active:cursor-grabbing"
      />

      {/* Solid-surface Dynamic Inspection Readout when hovering meshes (no backdrop-blur or full pill) */}
      {hoveredPrompt && !isCinemaMode ? (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-[10px] bg-[#081838]/95 text-white text-[11px] font-medium border border-[#C59028]/55 shadow-md pointer-events-none truncate max-w-[92%]">
          {hoveredPrompt}
        </div>
      ) : null}

      {/* Unobstructed Unified Collapsible Bottom Dock (no backdrop-filter over WebGL) */}
      <div
        className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 w-[95%] max-w-[500px] transition-transform duration-300 pointer-events-auto ${
          isCinemaMode ? "translate-y-[calc(100%+8px)]" : "translate-y-0"
        }`}
      >
        <div className="rounded-[12px] bg-white/95 border border-[#D4CCE3] shadow-md px-2.5 py-1.5 flex items-center justify-between gap-1.5 text-xs">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
            {STUDIO_PRESETS.map((preset) => {
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset.id)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[7px] font-semibold text-[11px] transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#51406F] text-white shadow-xs"
                      : "bg-[#F2EFF8] text-[#081838] hover:bg-[#DDD6EB]"
                  }`}
                >
                  {preset.id === "studio" && <Compass className="w-3 h-3" />}
                  {preset.id === "laptop" && <Laptop className="w-3 h-3" />}
                  {preset.id === "books" && <BookOpen className="w-3 h-3" />}
                  {preset.id === "cards" && <FileCheck2 className="w-3 h-3" />}
                  <span>{preset.labelBn}</span>
                </button>
              );
            })}
          </div>

          {/* Reset & Cinema Toggle */}
          <div className="flex items-center gap-1 shrink-0 border-l border-[#D4CCE3] pl-1.5">
            <button
              type="button"
              onClick={() => selectPreset("studio")}
              title="রিসেট ভিউ"
              className="p-1 rounded-[6px] text-[#596775] hover:text-[#081838] hover:bg-[#F2EFF8] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCinemaMode(true)}
              title="হাইড প্যানেল (সিনেমা মোড)"
              className="p-1 rounded-[6px] text-[#596775] hover:text-[#081838] hover:bg-[#F2EFF8] transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Restore Dock Button when Cinema Mode active */}
      {isCinemaMode ? (
        <button
          type="button"
          onClick={() => setIsCinemaMode(false)}
          className="absolute bottom-2.5 right-3 px-2.5 py-1 rounded-[8px] bg-white/90 text-[#081838] text-[11px] font-bold border border-[#D4CCE3] shadow-md hover:bg-white transition-colors cursor-pointer inline-flex items-center gap-1"
        >
          <Maximize2 className="w-3 h-3" />
          <span>কন্ট্রোল দেখান</span>
        </button>
      ) : null}
    </div>
  );
}

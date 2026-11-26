"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  attachContextLossRecovery,
  createContactShadowTexture,
  createResizeObserver,
  createRoomEnvironmentTexture,
  detectSoftwareWebGL,
  disposeObject3D,
  disposeRoomEnvironment,
  type RoomEnvironmentResources,
} from "@/components/three/threeUtils";

export type EcosystemPillarId =
  | "courses"
  | "services"
  | "books"
  | "licensing"
  | "consultancy";

export interface EcosystemNodeSpec {
  id: EcosystemPillarId;
  labelBn: string;
  labelEn: string;
  href: string;
  descriptionBn: string;
  colorHex: number;
}

export const ECOSYSTEM_NODES: EcosystemNodeSpec[] = [
  {
    id: "courses",
    labelBn: "কোর্স ও প্রশিক্ষণ",
    labelEn: "Courses",
    href: "/courses",
    descriptionBn:
      "Tax, VAT, e-GP, E-commerce ও RJSC সহ ১০টি ব্যবহারিক প্রশিক্ষণ ট্র্যাক।",
    colorHex: 0x51406f,
  },
  {
    id: "services",
    labelBn: "পেশাদার সেবা",
    labelEn: "Services",
    href: "/services",
    descriptionBn:
      "১১টি বিভাগে ব্যবসায়িক কমপ্লায়েন্স সেবা ও সরাসরি WhatsApp সহায়তা।",
    colorHex: 0x00865a,
  },
  {
    id: "books",
    labelBn: "প্রকাশনা ও বই",
    labelEn: "Books",
    href: "/books",
    descriptionBn:
      "আসন্ন কমপ্লায়েন্স হ্যান্ডবুক প্রিভিউ ও প্রাক-নিবন্ধন অনুসন্ধান।",
    colorHex: 0x6b5691,
  },
  {
    id: "licensing",
    labelBn: "লাইসেন্সিং",
    labelEn: "Licensing",
    href: "/licensing",
    descriptionBn:
      "ট্রেড লাইসেন্স, Smart RJSC, DIFE ও ফায়ার সার্ভিস নির্দেশিকা।",
    colorHex: 0x163266,
  },
  {
    id: "consultancy",
    labelBn: "কনসালটেন্সি",
    labelEn: "Consultancy",
    href: "/consultancy",
    descriptionBn:
      "আপনার ব্যবসার নির্দিষ্ট জটিলতা অনুযায়ী সরাসরি পরামর্শ অনুরোধ।",
    colorHex: 0xc59028,
  },
];

interface HeroCanvas3DProps {
  selectedPillar?: EcosystemPillarId;
  onSelectPillar?: (pillar: EcosystemPillarId) => void;
}

/**
 * Interactive 3D Business Ecosystem (Experience B)
 * Represents BCP's interconnected divisions orbiting the institutional core,
 * with throttled Raycaster selection via proxy hit meshes and RoomEnvironment IBL.
 */
export function HeroCanvas3D({
  selectedPillar = "courses",
  onSelectPillar,
}: HeroCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<EcosystemPillarId>(selectedPillar);
  const callbackRef = useRef(onSelectPillar);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    selectedRef.current = selectedPillar;
  }, [selectedPillar]);

  useEffect(() => {
    callbackRef.current = onSelectPillar;
  }, [onSelectPillar]);

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
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 340;

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.35, 6.2);
    camera.lookAt(0, 0.15, 0);

    let envResources: RoomEnvironmentResources | null = null;
    if (!isSoftwareGl) {
      try {
        envResources = createRoomEnvironmentTexture(renderer);
        scene.environment = envResources.envMap;
      } catch {
        envResources = null;
      }
    }

    const hemi = new THREE.HemisphereLight(0xf2eff8, 0x161d2e, 0.9);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff5e4, 1.45);
    key.position.set(4, 6, 4);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xddd6eb, 0.85);
    rim.position.set(-4, 2, -4);
    scene.add(rim);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 5.6),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.95;
    mainGroup.add(shadowPlane);

    const coreMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.68, 1),
      new THREE.MeshStandardMaterial({
        color: 0x081838,
        roughness: 0.28,
        metalness: 0.72,
      }),
    );
    mainGroup.add(coreMesh);

    const coreGoldRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.028, 16, 84),
      new THREE.MeshStandardMaterial({
        color: 0xc59028,
        roughness: 0.22,
        metalness: 0.85,
      }),
    );
    coreGoldRing.rotation.x = Math.PI / 2.2;
    mainGroup.add(coreGoldRing);

    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.014, 12, 100),
      new THREE.MeshBasicMaterial({
        color: 0xa599c2,
        transparent: true,
        opacity: 0.55,
      }),
    );
    orbitRing.rotation.x = Math.PI / 2;
    mainGroup.add(orbitRing);

    const hitMeshes: THREE.Mesh[] = [];
    const nodeGroups: Array<{
      id: EcosystemPillarId;
      group: THREE.Group;
      orb: THREE.Mesh;
      halo: THREE.Mesh;
      baseAngle: number;
    }> = [];

    ECOSYSTEM_NODES.forEach((node, idx) => {
      const angle = (idx / ECOSYSTEM_NODES.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 2.05;
      const group = new THREE.Group();
      group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 24, 24),
        new THREE.MeshStandardMaterial({
          color: node.colorHex,
          roughness: 0.25,
          metalness: 0.45,
          emissive: new THREE.Color(node.colorHex),
          emissiveIntensity: 0.18,
        }),
      );
      group.add(orb);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.38, 0.018, 12, 48),
        new THREE.MeshStandardMaterial({
          color: 0xc59028,
          roughness: 0.25,
          metalness: 0.8,
        }),
      );
      halo.rotation.x = Math.PI / 2;
      group.add(halo);

      const hitProxy = new THREE.Mesh(
        new THREE.SphereGeometry(0.48, 12, 12),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hitProxy.userData.pillarId = node.id;
      group.add(hitProxy);
      hitMeshes.push(hitProxy);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        ),
      ]);
      const connector = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({
          color: 0xc59028,
          transparent: true,
          opacity: 0.35,
        }),
      );
      mainGroup.add(connector);

      mainGroup.add(group);
      nodeGroups.push({
        id: node.id,
        group,
        orb,
        halo,
        baseAngle: angle,
      });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const targetScaleVec = new THREE.Vector3(1, 1, 1);
    let hoveredPillar: EcosystemPillarId | null = null;
    let lastRaycastTime = 0;

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    let isDragging = false;
    let prevDragX = 0;
    let manualOrbitOffset = 0;
    let dragVelocity = 0;
    let dragDist = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevDragX = e.clientX;
      dragDist = 0;
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevDragX;
        prevDragX = e.clientX;
        dragVelocity += dx * 0.004;
        dragDist += Math.abs(dx);
      }

      const now = performance.now();
      if (now - lastRaycastTime < 32) return;
      lastRaycastTime = now;
      updatePointer(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      const hitId =
        (hits[0]?.object.userData.pillarId as EcosystemPillarId | undefined) ??
        null;
      hoveredPillar = hitId;
      renderer.domElement.style.cursor = isDragging
        ? "grabbing"
        : hitId
        ? "pointer"
        : "grab";
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      if (dragDist < 6) {
        updatePointer(e.clientX, e.clientY);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(hitMeshes, false);
        const hitId = hits[0]?.object.userData.pillarId as
          | EcosystemPillarId
          | undefined;
        if (hitId) {
          callbackRef.current?.(hitId);
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    const stopResize = createResizeObserver(container, (newW, newH) => {
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      renderer.render(scene, camera);
    });

    let isVisible = true;
    let isTabActive = !document.hidden;
    let contextLost = false;
    let cancelled = false;
    let rafId = 0;
    let timeoutId = 0;

    const stopContextLoss = attachContextLossRecovery(
      renderer.domElement,
      () => {
        contextLost = true;
        setWebglSupported(false);
      },
      () => {
        contextLost = false;
        setWebglSupported(true);
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

    const renderFrame = () => {
      if (cancelled) return;
      if (contextLost || !isVisible || !isTabActive) {
        scheduleNext();
        return;
      }

      const elapsed = clock.getElapsedTime();
      if (!prefersReducedMotion) {
        dragVelocity *= 0.92;
        manualOrbitOffset += dragVelocity;
        mainGroup.rotation.y = manualOrbitOffset + elapsed * 0.14;
        coreMesh.rotation.y = -elapsed * 0.3;
        coreGoldRing.rotation.z = elapsed * 0.25;
      } else {
        mainGroup.rotation.y = manualOrbitOffset;
      }

      const activeId = selectedRef.current;
      nodeGroups.forEach((node, idx) => {
        const isActive = node.id === activeId;
        const isHovered = node.id === hoveredPillar;
        const targetScale = isActive ? 1.32 : isHovered ? 1.18 : 1;
        targetScaleVec.set(targetScale, targetScale, targetScale);
        node.group.scale.lerp(targetScaleVec, 0.12);
        node.group.position.y = prefersReducedMotion
          ? isActive
            ? 0.18
            : 0
          : Math.sin(elapsed * 1.4 + idx) * 0.1 + (isActive ? 0.18 : 0);

        const orbMat = node.orb.material as THREE.MeshStandardMaterial;
        orbMat.emissiveIntensity = isActive ? 0.52 : isHovered ? 0.35 : 0.16;
        node.halo.visible = isActive || isHovered;
      });

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

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      stopResize();
      stopContextLoss();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      disposeObject3D(scene);
      disposeRoomEnvironment(envResources);
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div
        className="w-full min-h-[280px] flex items-center justify-center p-6"
        aria-hidden="true"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-sm">
          {ECOSYSTEM_NODES.map((node) => (
            <div
              key={node.id}
              className="rounded-[12px] border border-[#D4CCE3] bg-white px-3 py-2.5 text-center shadow-xs"
            >
              <p className="text-xs font-bold text-[#081838]">{node.labelBn}</p>
              <p className="text-[11px] text-[#51406F] font-en">{node.labelEn}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[290px] sm:h-[330px] flex items-center justify-center relative pointer-events-auto"
      aria-label="ইন্টারেক্টিভ ৩ডি কমপ্লায়েন্স ও ব্যবসায়িক ইকোসিস্টেম নেটওয়ার্ক"
      role="img"
    />
  );
}

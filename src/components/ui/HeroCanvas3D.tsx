"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * HeroCanvas3D
 *
 * Professional, fintech-grade interactive 3D visual for Business Compliance Partner.
 * Features an orbital compliance shield wireframe, concentric golden rings representing
 * regulatory harmony, and interconnected particle constellation nodes representing
 * the 437+ solutions across Bangladesh's business ecosystem.
 *
 * Performance & Accessibility:
 * - Reduced motion support (prefers-reduced-motion)
 * - IntersectionObserver to stop render loop when offscreen
 * - Document visibility listener to pause when backgrounded
 * - Graceful WebGL fallback with zero crashes
 * - Clean disposal of all Three.js resources on unmount
 */
export function HeroCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Detect WebGL capability safely
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7.5;

    // Brand Palette in Three.js
    const GOLD = 0xc59028;
    const GOLD_LIGHT = 0xdfb15b;
    const NAVY_ACCENT = 0x1f3a60;
    const EMERALD_HINT = 0x00865a;

    // Main 3D Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Concentric Regulatory Rings (Torus Wireframes)
    const ringGeo1 = new THREE.TorusGeometry(2.2, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: GOLD,
      transparent: true,
      opacity: 0.65,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.6, 0.012, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: GOLD_LIGHT,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    mainGroup.add(ring2);

    const ringGeo3 = new THREE.TorusGeometry(1.8, 0.01, 16, 90);
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: NAVY_ACCENT,
      transparent: true,
      opacity: 0.45,
    });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.y = Math.PI / 3;
    mainGroup.add(ring3);

    // 2. Core Geometric Compliance Polyhedron (Icosahedron wireframe)
    const icoGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const icoWireMat = new THREE.MeshBasicMaterial({
      color: GOLD_LIGHT,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoWireMat);
    mainGroup.add(icoMesh);

    // 3. Inner Pillar Octahedron
    const octGeo = new THREE.OctahedronGeometry(0.7, 0);
    const octWireMat = new THREE.MeshBasicMaterial({
      color: GOLD,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const octMesh = new THREE.Mesh(octGeo, octWireMat);
    mainGroup.add(octMesh);

    // 4. Ecosystem Constellation Particles (representing 437+ services)
    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color(GOLD);
    const goldLightColor = new THREE.Color(GOLD_LIGHT);
    const emeraldColor = new THREE.Color(EMERALD_HINT);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.4 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor =
        i % 5 === 0
          ? emeraldColor
          : i % 2 === 0
          ? goldColor
          : goldLightColor;

      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particlesGeo.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particlesMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    mainGroup.add(particles);

    // Mouse / Cursor Tracking with Smooth Damping
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = container.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;

      targetRotY = x * 0.7;
      targetRotX = y * 0.7;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop with Visibility & Intersection Optimization
    let isVisible = true;
    let isTabActive = true;
    let animationFrameId: number;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const clock = new THREE.Clock();

    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);

      if (!isVisible || !isTabActive) return;

      const delta = clock.getDelta();

      if (!prefersReducedMotion) {
        // Continuous gentle rotation
        mainGroup.rotation.y += delta * 0.18;
        ring1.rotation.z += delta * 0.12;
        ring2.rotation.z -= delta * 0.08;
        ring3.rotation.x += delta * 0.14;
        icoMesh.rotation.y -= delta * 0.1;
        octMesh.rotation.y += delta * 0.25;
        octMesh.rotation.x += delta * 0.15;

        // Smooth mouse damping
        currentRotX += (targetRotX - currentRotX) * 0.05;
        currentRotY += (targetRotY - currentRotY) * 0.05;

        mainGroup.rotation.x = currentRotX * 0.5;
        mainGroup.rotation.z = currentRotY * 0.3;
      }

      renderer.render(scene, camera);
    };

    animateLoop();

    // Cleanup resources cleanly on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      ringGeo3.dispose();
      ringMat3.dispose();
      icoGeo.dispose();
      icoWireMat.dispose();
      octGeo.dispose();
      octWireMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    // Elegant SVG fallback for environments without WebGL
    return (
      <div
        className="w-full h-full min-h-[360px] flex items-center justify-center relative overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-72 h-72 rounded-full border border-ps-gold/30 flex items-center justify-center animate-pulse">
          <div className="w-56 h-56 rounded-full border border-ps-gold/50 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border border-ps-gold/70" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center relative pointer-events-auto cursor-grab active:cursor-grabbing"
      aria-label="ইন্টারেক্টিভ ৩ডি কমপ্লায়েন্স ও ব্যবসায়িক ইকোসিস্টেম নেটওয়ার্ক"
      role="img"
    />
  );
}

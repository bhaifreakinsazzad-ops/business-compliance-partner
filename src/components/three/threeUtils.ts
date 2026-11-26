import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Probes WebGL renderer string to detect software rasterizers (e.g. SwiftShader,
 * llvmpipe, softpipe) strictly for performance tuning (antialias, pixelRatio,
 * environment maps, frame pacing). Scene geometry and layout remain identical.
 */
export function detectSoftwareWebGL(renderer: THREE.WebGLRenderer): boolean {
  try {
    const gl = renderer.getContext();
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return false;
    const rendererStr = String(
      gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "",
    );
    return /swiftshader|llvmpipe|softpipe|software|mesa offscreen/i.test(
      rendererStr,
    );
  } catch {
    return false;
  }
}

export function createRoomEnvironmentTexture(
  renderer: THREE.WebGLRenderer,
): { envMap: THREE.Texture; pmrem: THREE.PMREMGenerator; envScene: RoomEnvironment } {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envScene = new RoomEnvironment();
  const renderTarget = pmrem.fromScene(envScene, 0.04);
  return {
    envMap: renderTarget.texture,
    pmrem,
    envScene,
  };
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 124);
    grad.addColorStop(0, "rgba(8, 24, 56, 0.34)");
    grad.addColorStop(0.55, "rgba(81, 64, 111, 0.14)");
    grad.addColorStop(1, "rgba(81, 64, 111, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBookSpineTexture(params: {
  title: string;
  bgHex: string;
  accentHex: string;
  textHex?: string;
}): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 112;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = params.bgHex;
    ctx.fillRect(0, 0, 512, 112);

    // Subtle spine ribs & metallic gold bands
    ctx.fillStyle = params.accentHex;
    ctx.fillRect(28, 12, 6, 88);
    ctx.fillRect(42, 12, 2, 88);
    ctx.fillRect(468, 12, 2, 88);
    ctx.fillRect(478, 12, 6, 88);

    // Subtle sheen gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 112);
    grad.addColorStop(0, "rgba(255,255,255,0.14)");
    grad.addColorStop(0.5, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 112);

    ctx.fillStyle = params.textHex || "#F8F8F8";
    ctx.font = "600 32px Inter, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(params.title, 66, 56, 360);

    // Small BCP emblem mark on right
    ctx.fillStyle = params.accentHex;
    ctx.font = "700 20px Georgia, serif";
    ctx.textAlign = "right";
    ctx.fillText("BCP", 456, 56);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function createLaptopScreenTexture(
  logoImage?: HTMLImageElement | null,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const bg = ctx.createLinearGradient(0, 0, 768, 480);
    bg.addColorStop(0, "#1D1536");
    bg.addColorStop(0.55, "#51406F");
    bg.addColorStop(1, "#081838");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 768, 480);

    // Subtle radial lavender glow
    const glow = ctx.createRadialGradient(384, 210, 20, 384, 210, 290);
    glow.addColorStop(0, "rgba(221, 214, 235, 0.34)");
    glow.addColorStop(1, "rgba(221, 214, 235, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 768, 480);

    // Top studio bar
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(28, 24, 712, 34);
    ctx.fillStyle = "#DFB15B";
    ctx.beginPath();
    ctx.arc(52, 41, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "600 16px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("BUSINESS COMPLIANCE PARTNER  •  KNOWLEDGE STUDIO", 74, 41);

    // Official circular logo or fallback gold ring
    if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(384, 194, 86, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImage, 298, 108, 172, 172);
      ctx.restore();
    } else {
      ctx.strokeStyle = "#C59028";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(384, 194, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(384, 194, 74, 0, Math.PI * 2);
      ctx.fill();
    }

    // Crisp typography below badge
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 28px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Business Compliance Partner", 384, 326);

    ctx.fillStyle = "#DFB15B";
    ctx.font = "600 16px Inter, sans-serif";
    ctx.fillText("Courses  •  Services  •  Books  •  Advisory", 384, 362);

    // Subtle bottom hairline
    ctx.fillStyle = "rgba(197, 144, 40, 0.7)";
    ctx.fillRect(224, 396, 320, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function createDocumentCardTexture(params: {
  title: string;
  subtitle: string;
  accentHex: string;
}): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 360, 128);

    ctx.strokeStyle = "#D4CCE3";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 356, 124);

    // Left icon block
    ctx.fillStyle = "#F2EFF8";
    ctx.fillRect(20, 24, 80, 80);
    ctx.fillStyle = params.accentHex;
    ctx.fillRect(36, 44, 48, 8);
    ctx.fillRect(36, 60, 38, 8);
    ctx.fillRect(36, 76, 44, 8);

    ctx.fillStyle = "#081838";
    ctx.font = "700 24px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(params.title, 118, 32, 220);

    ctx.fillStyle = "#51406F";
    ctx.font = "500 17px Inter, sans-serif";
    ctx.fillText(params.subtitle, 118, 68, 220);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
      obj.geometry?.dispose();
      const materials = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      for (const mat of materials) {
        if (!mat) continue;
        for (const value of Object.values(mat)) {
          if (value instanceof THREE.Texture) {
            value.dispose();
          }
        }
        mat.dispose();
      }
    }
  });
}

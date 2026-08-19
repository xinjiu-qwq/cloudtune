/**
 * Dominant color extraction from an image URL via a downscaled canvas.
 * Avoids external dependencies; good enough for ambient backgrounds.
 */

export interface Palette {
  /** Dominant color as [r, g, b]. */
  dominant: [number, number, number];
  /** Darker companion tone for the gradient end. */
  deep: [number, number, number];
}

export function cssRgb(c: [number, number, number], alpha = 1): string {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
}

export function extractPalette(src: string): Promise<Palette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas unavailable"));
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Weighted average biased toward saturated, mid-luminance pixels,
        // which read better as ambient color than pure averages.
        let r = 0;
        let g = 0;
        let b = 0;
        let w = 0;
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          const max = Math.max(pr, pg, pb);
          const min = Math.min(pr, pg, pb);
          const sat = max === 0 ? 0 : (max - min) / max;
          const lum = (pr + pg + pb) / 765; // 0..1
          const weight = 0.15 + sat * 2 + (1 - Math.abs(lum - 0.5)) * 0.8;
          r += pr * weight;
          g += pg * weight;
          b += pb * weight;
          w += weight;
        }
        const dominant: [number, number, number] = [
          Math.round(r / w),
          Math.round(g / w),
          Math.round(b / w),
        ];
        const deep: [number, number, number] = dominant.map((v) => Math.round(v * 0.35)) as [
          number,
          number,
          number,
        ];
        resolve({ dominant, deep });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

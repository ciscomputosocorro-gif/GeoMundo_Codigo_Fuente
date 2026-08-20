import { useEffect, useRef } from "react";
import { Figura } from "@/data/figuras";

interface Pt { x: number; y: number; }

function generarObjetivos(id: string, cx: number, cy: number, r: number): Pt[] {
  const pts: Pt[] = [];
  switch (id) {
    case "cubo": {
      const s = r * 0.82;
      const N = 96;
      for (let i = 0; i < N; i++) {
        const t = (i / N) * 4;
        const side = Math.floor(t);
        const u = t - side;
        if (side === 0)      pts.push({ x: cx - s + u * 2 * s, y: cy - s });
        else if (side === 1) pts.push({ x: cx + s,              y: cy - s + u * 2 * s });
        else if (side === 2) pts.push({ x: cx + s - u * 2 * s, y: cy + s });
        else                 pts.push({ x: cx - s,              y: cy + s - u * 2 * s });
      }
      break;
    }
    case "esfera": {
      const N = 90;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        pts.push({ x: cx + Math.cos(a) * r * 0.86, y: cy + Math.sin(a) * r * 0.86 });
      }
      break;
    }
    case "cilindro": {
      const ew = r * 0.58, eh = r * 0.17, ht = r * 0.76;
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        pts.push({ x: cx + Math.cos(a) * ew, y: cy - ht + Math.sin(a) * eh });
      }
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        pts.push({ x: cx + Math.cos(a) * ew, y: cy + ht + Math.sin(a) * eh });
      }
      for (let i = 0; i < 22; i++) pts.push({ x: cx - ew, y: cy - ht + (i / 21) * 2 * ht });
      for (let i = 0; i < 22; i++) pts.push({ x: cx + ew, y: cy - ht + (i / 21) * 2 * ht });
      break;
    }
    case "piramide": {
      const top = { x: cx, y: cy - r * 0.90 };
      const bl  = { x: cx - r * 0.82, y: cy + r * 0.68 };
      const br  = { x: cx + r * 0.82, y: cy + r * 0.68 };
      const N = 32;
      for (let i = 0; i < N; i++) {
        const t = i / N;
        pts.push({ x: bl.x + (br.x - bl.x) * t, y: bl.y });
      }
      for (let i = 0; i < N; i++) {
        const t = i / N;
        pts.push({ x: bl.x + (top.x - bl.x) * t, y: bl.y + (top.y - bl.y) * t });
      }
      for (let i = 0; i < N; i++) {
        const t = i / N;
        pts.push({ x: top.x + (br.x - top.x) * t, y: top.y + (br.y - top.y) * t });
      }
      break;
    }
  }
  return pts;
}

function drawMiniFigura(ctx: CanvasRenderingContext2D, id: string, size: number, color: string) {
  ctx.fillStyle = color;
  switch (id) {
    case "cubo":
      ctx.fillRect(-size, -size, size * 2, size * 2);
      break;
    case "esfera":
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "cilindro": {
      const w = size * 0.72, h = size * 1.30, cr = size * 0.65;
      ctx.beginPath();
      ctx.moveTo(-w + cr, -h);
      ctx.lineTo( w - cr, -h);
      ctx.arcTo(  w, -h,  w, -h + cr, cr);
      ctx.lineTo( w,  h - cr);
      ctx.arcTo(  w,  h,  w - cr, h, cr);
      ctx.lineTo(-w + cr, h);
      ctx.arcTo( -w,  h, -w,  h - cr, cr);
      ctx.lineTo(-w, -h + cr);
      ctx.arcTo( -w, -h, -w + cr, -h, cr);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "piramide": {
      const h = size * 1.40, base = size * 1.20;
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.lineTo(-base, h * 0.55);
      ctx.lineTo( base, h * 0.55);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
}

interface Props { figura: Figura; }

export function ParticulasForma({ figura }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRef   = useRef(false);
  const rafRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    stopRef.current = false;

    const startAnim = (W: number, H: number) => {
      cancelAnimationFrame(rafRef.current);

      canvas.width  = W;
      canvas.height = H;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cx = W / 2;
      const cy = H / 2;
      const r  = Math.min(W, H) * 0.34;

      const outlineTargets = generarObjetivos(figura.id, cx, cy, r);

      // Smaller copies — only if there's enough room (avoid clipping on small screens)
      const rSide = Math.min(W, H) * 0.065;
      const sideTargets: Pt[] = H > 300
        ? [
            ...generarObjetivos(figura.id, cx, rSide * 1.8, rSide),
            ...generarObjetivos(figura.id, cx, H - rSide * 1.8, rSide),
          ]
        : [];

      const targets = [...outlineTargets, ...sideTargets];

      interface Particula {
        x: number; y: number;
        vx: number; vy: number;
        tx: number; ty: number;
        size: number;
        angle: number;
        angleV: number;
      }

      const FALL_DUR   = 2200;
      const SETTLE_DUR = 2000;
      const HOLD_DUR   = 1400;
      const FADE_DUR   = 900;
      const CYCLE      = FALL_DUR + SETTLE_DUR + HOLD_DUR + FADE_DUR;

      const resetParticle = (p: Particula) => {
        p.x      = cx + (Math.random() - 0.5) * W;
        p.y      = -15 - Math.random() * H * 0.5;
        p.vx     = (Math.random() - 0.5) * 1.5;
        p.vy     = Math.random() * 1.2 + 0.3;
        p.angle  = Math.random() * Math.PI * 2;
        p.angleV = (Math.random() - 0.5) * 0.12;
      };

      const ps: Particula[] = targets.map(t => {
        const p: Particula = {
          x: 0, y: 0, vx: 0, vy: 0,
          tx: t.x, ty: t.y,
          size: 3.8 + Math.random() * 2.4,
          angle: 0, angleV: 0,
        };
        resetParticle(p);
        return p;
      });

      let startTime: number | null = null;

      const tick = (ts: number) => {
        if (stopRef.current) return;
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const cycleElapsed = elapsed % CYCLE;

        if (cycleElapsed < 16) ps.forEach(p => resetParticle(p));

        ctx.clearRect(0, 0, W, H);

        let globalAlpha = 1;
        if (cycleElapsed > FALL_DUR + SETTLE_DUR + HOLD_DUR) {
          globalAlpha = 1 - (cycleElapsed - FALL_DUR - SETTLE_DUR - HOLD_DUR) / FADE_DUR;
        }
        ctx.globalAlpha = Math.max(0, globalAlpha);

        for (const p of ps) {
          if (cycleElapsed < FALL_DUR) {
            p.vy    += 0.10;
            p.x     += p.vx;
            p.y     += p.vy;
            p.angle += p.angleV;
            if (p.y > H + 20) p.y = H + 20;
          } else if (cycleElapsed < FALL_DUR + SETTLE_DUR) {
            const progress = (cycleElapsed - FALL_DUR) / SETTLE_DUR;
            const ease = 0.03 + progress * 0.05;
            p.x     += (p.tx - p.x)   * ease;
            p.y     += (p.ty - p.y)   * ease;
            p.angle += (0   - p.angle) * ease;
            p.angleV *= 0.88;
          } else {
            p.x     = p.tx;
            p.y     = p.ty;
            p.angle = 0;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          drawMiniFigura(ctx, figura.id, p.size, figura.color);
          ctx.restore();
        }

        ctx.globalAlpha = 1;
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    // Use ResizeObserver so the canvas always matches the real container size
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) startAnim(width, height);
    });
    ro.observe(parent);

    return () => {
      stopRef.current = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [figura.id, figura.color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}

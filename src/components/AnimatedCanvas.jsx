import { useEffect, useRef } from "react";

const AnimatedCanvas = ({ opacity = 0.55 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NODE_COUNT = 50, CONNECT_DIST = 130;

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 2 + 1,
      highlight: Math.random() < 0.13,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = performance.now() / 1000;

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const fade = 1 - dist / CONNECT_DIST;
            const sp   = nodes[i].highlight || nodes[j].highlight;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = sp
              ? `rgba(34,211,238,${fade * 0.5})`
              : `rgba(96,165,250,${fade * 0.18})`;
            ctx.lineWidth = sp ? 0.85 : 0.5;
            ctx.stroke();
          }
        }

      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + n.phase);
        if (n.highlight) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 7);
          g.addColorStop(0, `rgba(34,211,238,${0.2 * pulse})`);
          g.addColorStop(1, "rgba(34,211,238,0)");
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 7, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + pulse * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34,211,238,${0.7 + pulse * 0.3})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96,165,250,${0.28 + pulse * 0.1})`;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity }}
    />
  );
};

export default AnimatedCanvas;
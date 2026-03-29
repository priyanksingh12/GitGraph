import { useEffect, useRef } from "react";

const BackgroundCanvas = () => {
const canvasRef = useRef();
const particlesRef = useRef([]);

useEffect(() => {
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");


let width, height;

const resize = () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
};

resize();
window.addEventListener("resize", resize);

// ✨ particles
particlesRef.current = Array.from({ length: 90 }).map(() => ({
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 2 + 0.5,
  speedX: (Math.random() - 0.5) * 0.3,
  speedY: (Math.random() - 0.5) * 0.3,
  opacity: Math.random(),
}));

let shift = 0;

const animate = () => {
  ctx.clearRect(0, 0, width, height);

  // 🌈 gradient
  shift += 0.002;
  const gradient = ctx.createRadialGradient(
    width * (0.5 + Math.sin(shift) * 0.2),
    height * 0.5,
    100,
    width * 0.5,
    height * 0.5,
    width
  );

  gradient.addColorStop(0, "#020817");   // navy
  gradient.addColorStop(0.5, "#1e1b4b"); // purple
  gradient.addColorStop(1, "#042f2e");   // teal

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // ✨ particles
  particlesRef.current.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    p.opacity += (Math.random() - 0.5) * 0.02;
    p.opacity = Math.max(0.1, Math.min(1, p.opacity));

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 255, ${p.opacity * 0.5})`;
    ctx.fill();
  });

  requestAnimationFrame(animate);
};

animate();

return () => window.removeEventListener("resize", resize);


}, []);

return ( <canvas
   ref={canvasRef}
   className="absolute inset-0 z-0"
 />
);
};

export default BackgroundCanvas;

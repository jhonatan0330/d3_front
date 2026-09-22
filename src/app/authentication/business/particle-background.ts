import { Directive, AfterViewInit, OnDestroy, NgZone, ElementRef } from '@angular/core';

@Directive({
    selector: 'canvas[appParticleBackground]',
    standalone: true
})
export class ParticleBackgroundDirective implements AfterViewInit, OnDestroy {
    private _animationFrameId: number | null = null;
    private _cleanup: (() => void) | null = null;

    constructor(
        private _el: ElementRef<HTMLCanvasElement>,
        private _ngZone: NgZone
    ) {}

    ngAfterViewInit(): void {
        this._ngZone.runOutsideAngular(() => {
            this._initCanvas();
        });
    }

    ngOnDestroy(): void {
        if (this._animationFrameId !== null) {
            cancelAnimationFrame(this._animationFrameId);
        }
        this._cleanup?.();
    }

    private _initCanvas(): void {
        const canvas = this._el.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const colorDark = { r: 96, g: 165, b: 250 };
        const colorLight = { r: 37, g: 99, b: 235 };
        const getColor = () =>
            document.body.classList.contains('dark') ? colorDark : colorLight;

        let color = getColor();
        const maxParticles = 70;
        const particleAlpha = 0.25;
        const connectionAlpha = 0.09;
        const mouseConnectionAlpha = 0.14;
        const connectionDistance = 120;
        const mouseConnectionDistance = 180;

        const particles: { x: number; y: number; vx: number; vy: number; radius: number; baseRadius: number }[] = [];
        const mouse = { x: null as number | null, y: null as number | null, radius: 130, active: false };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; };
        const onMouseLeave = () => { mouse.x = null; mouse.y = null; mouse.active = false; };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseleave', onMouseLeave);

        this._cleanup = () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseleave', onMouseLeave);
        };

        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1,
                baseRadius: Math.random() * 2 + 1,
            });
        }

        const loop = () => {
            color = getColor();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.03)`;
            ctx.lineWidth = 1;
            const gridSpacing = 90;
            for (let x = 0; x < canvas.width; x += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            for (const p of particles) {
                if (mouse.active && mouse.x !== null && mouse.y !== null) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        p.x += Math.cos(angle) * force * 1.5;
                        p.y += Math.sin(angle) * force * 1.5;
                        p.radius = p.baseRadius + force * 1.5;
                    } else if (p.radius > p.baseRadius) {
                        p.radius -= 0.05;
                    }
                } else if (p.radius > p.baseRadius) {
                    p.radius -= 0.05;
                }

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) { p.x = 0; p.vx *= -1; }
                else if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -1; }
                if (p.y < 0) { p.y = 0; p.vy *= -1; }
                else if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -1; }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${particleAlpha})`;
                ctx.fill();
            }

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDistance) {
                        const alpha = (1 - dist / connectionDistance) * connectionAlpha;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
                if (mouse.active && mouse.x !== null && mouse.y !== null) {
                    const dx = p1.x - mouse.x;
                    const dy = p1.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouseConnectionDistance) {
                        const alpha = (1 - dist / mouseConnectionDistance) * mouseConnectionAlpha;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            this._animationFrameId = requestAnimationFrame(loop);
        };

        this._animationFrameId = requestAnimationFrame(loop);
    }
}

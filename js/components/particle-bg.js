(function(global) {
  'use strict';

  class ParticleBG {
    constructor(canvasId, options = {}) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) {
        console.warn('ParticleBG: Canvas not found');
        return;
      }

      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.lines = [];
      this.mouseX = 0;
      this.mouseY = 0;
      this.isHovering = false;
      this.animationId = null;
      this.lastFrameTime = 0;
      this.fps = 60;
      this.frameInterval = 1000 / this.fps;

      this.options = {
        particleCount: options.particleCount || 60,
        particleColor: options.particleColor || '#ed751c',
        lineColor: options.lineColor || 'rgba(237, 117, 28, 0.15)',
        particleSize: options.particleSize || 2,
        lineLength: options.lineLength || 150,
        particleSpeed: options.particleSpeed || 0.5,
        interactive: options.interactive !== false,
        ...options
      };

      this.resize();
      this.init();
      this.bindEvents();
      this.animate();
    }

    resize() {
      if (!this.canvas) return;
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.canvas.style.width = window.innerWidth + 'px';
      this.canvas.style.height = window.innerHeight + 'px';
      this.ctx.scale(dpr, dpr);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }

    init() {
      this.particles = [];
      const count = Math.min(Math.floor((this.width * this.height) / 15000), this.options.particleCount);

      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle());
      }
    }

    createParticle(x, y) {
      const colors = [
        '237, 117, 28',
        '245, 158, 11',
        '217, 70, 239',
        '14, 165, 233',
        '16, 185, 129'
      ];

      return {
        x: x !== undefined ? x : Math.random() * this.width,
        y: y !== undefined ? y : Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.options.particleSpeed,
        vy: (Math.random() - 0.5) * this.options.particleSpeed,
        size: Math.random() * this.options.particleSize + 1,
        alpha: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.init();
      });

      if (this.options.interactive) {
        this.canvas.addEventListener('mousemove', (e) => {
          this.mouseX = e.clientX;
          this.mouseY = e.clientY;
          this.isHovering = true;
        });

        this.canvas.addEventListener('mouseleave', () => {
          this.isHovering = false;
        });

        this.canvas.addEventListener('click', (e) => {
          this.addParticleBurst(e.clientX, e.clientY);
        });
      }
    }

    addParticleBurst(x, y) {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const particle = {
          x: x,
          y: y,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          size: this.options.particleSize * 1.5,
          alpha: 1,
          color: '237, 117, 28',
          decay: 0.02
        };
        this.particles.push(particle);
      }
    }

    updateParticles() {
      this.particles = this.particles.filter(p => {
        if (p.decay) {
          p.alpha -= p.decay;
          p.x += p.vx;
          p.y += p.vy;
          return p.alpha > 0;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > this.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.height) p.vy *= -1;

        if (this.options.interactive && this.isHovering) {
          const dx = this.mouseX - p.x;
          const dy = this.mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (100 - dist) / 100;
            p.x -= dx * force * 0.02;
            p.y -= dy * force * 0.02;
          }
        }

        return true;
      });
    }

    drawParticles() {
      this.particles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        this.ctx.fill();
      });
    }

    drawLines() {
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];

          if (p1.decay || p2.decay) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < this.options.lineLength) {
            const alpha = (1 - dist / this.options.lineLength) * 0.3;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(${p1.color}, ${alpha})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      }
    }

    drawGrid() {
      const gridSize = 60;
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      this.ctx.lineWidth = 1;

      for (let x = 0; x <= this.width; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.height);
        this.ctx.stroke();
      }

      for (let y = 0; y <= this.height; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.width, y);
        this.ctx.stroke();
      }
    }

    drawGradientOverlay() {
      const gradient = this.ctx.createRadialGradient(
        this.width / 2, this.height / 2, 0,
        this.width / 2, this.height / 2, this.width / 2
      );
      gradient.addColorStop(0, 'rgba(10, 10, 26, 0)');
      gradient.addColorStop(1, 'rgba(10, 10, 26, 0.4)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    animate(currentTime = 0) {
      if (!this.ctx) return;

      const deltaTime = currentTime - this.lastFrameTime;
      if (deltaTime < this.frameInterval) {
        this.animationId = requestAnimationFrame((t) => this.animate(t));
        return;
      }
      this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);

      this.ctx.clearRect(0, 0, this.width, this.height);

      this.drawGrid();
      this.updateParticles();
      this.drawLines();
      this.drawParticles();
      this.drawGradientOverlay();

      this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    start() {
      if (!this.animationId) {
        this.animate();
      }
    }

    stop() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    destroy() {
      this.stop();
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
    }
  }

  global.ParticleBG = ParticleBG;

})(window);

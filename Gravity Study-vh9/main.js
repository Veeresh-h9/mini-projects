class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.mass = Math.random() * 8 + 2;
        this.radius = Math.sqrt(this.mass) * 2;
        this.color = this.generateColor();
        this.trail = [];
        this.maxTrailLength = 20;
    }
    
    generateColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
            '#a55eea', '#26de81', '#fd79a8', '#fdcb6e'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(particles, gravity, canvas) {
        // Store previous position for trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Calculate gravitational forces
        particles.forEach(other => {
            if (other !== this) {
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > this.radius + other.radius) {
                    const force = gravity * this.mass * other.mass / (distance * distance);
                    const fx = force * dx / distance;
                    const fy = force * dy / distance;
                    
                    this.vx += fx / this.mass;
                    this.vy += fy / this.mass;
                }
            }
        });
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off walls with energy loss
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.vx *= -0.8;
            this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        }
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.vy *= -0.8;
            this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }
        
        // Apply slight damping
        this.vx *= 0.999;
        this.vy *= 0.999;
    }
    
    draw(ctx) {
        // Draw trail
        if (this.trail.length > 1) {
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = i / this.trail.length;
                ctx.globalAlpha = alpha * 0.3;
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }
        
        // Draw particle with gradient
        ctx.globalAlpha = 0.9;
        const gradient = ctx.createRadialGradient(
            this.x - this.radius/3, this.y - this.radius/3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.color + '20');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
    
    checkCollision(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + other.radius;
    }
    
    merge(other) {
        const totalMass = this.mass + other.mass;
        this.vx = (this.vx * this.mass + other.vx * other.mass) / totalMass;
        this.vy = (this.vy * this.mass + other.vy * other.mass) / totalMass;
        this.mass = totalMass;
        this.radius = Math.sqrt(this.mass) * 2;
        this.trail = [];
    }
}

class GravitySimulator {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.gravity = 0.5;
        this.isPaused = false;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.animate();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        // Mouse click to add particles
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.addParticle(x, y);
        });
        
        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.addParticle(x, y);
        });
        
        // Controls
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.particles = [];
            this.updateParticleCount();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            const pauseBtn = document.getElementById('pauseBtn');
            pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
            pauseBtn.classList.toggle('paused', this.isPaused);
        });
        
        document.getElementById('gravitySlider').addEventListener('input', (e) => {
            this.gravity = parseFloat(e.target.value);
            document.getElementById('gravityValue').textContent = this.gravity;
        });
    }
    
    addParticle(x, y) {
        this.particles.push(new Particle(x, y));
        this.updateParticleCount();
    }
    
    updateParticleCount() {
        document.getElementById('particleCount').textContent = this.particles.length;
    }
    
    animate() {
        if (!this.isPaused) {
            // Clear canvas with fade effect
            this.ctx.fillStyle = 'rgba(12, 12, 12, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update and draw particles
            this.particles.forEach(particle => {
                particle.update(this.particles, this.gravity, this.canvas);
                particle.draw(this.ctx);
            });
            
            // Handle collisions and merging
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    if (this.particles[i].checkCollision(this.particles[j])) {
                        this.particles[i].merge(this.particles[j]);
                        this.particles.splice(j, 1);
                        j--;
                        this.updateParticleCount();
                    }
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GravitySimulator();
});
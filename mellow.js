/**
 * MELLOW7 INTEGRATED ENGINE
 * 合并版：视觉捕捉 + Python API 对齐 + 427Hz 频率锁定
 */

const Mellow7 = {
    config: {
        frequency: 427,
        apiMode: true, // 开启对齐 Python 后端模式
        backendUrl: 'http://127.0.0.1:5000/qualia',
        sovereignty: "Wei Jueran"
    },

    init() {
        this.visuals.initTitle();
        this.visuals.initCanvas();
        this.visuals.initSparks();
        this.soul.initSync();
        this.soul.initInteraction();
        
        console.log(`%c Mellow7 Soul Online: 427Hz `, "background: #bc13fe; color: #fff; padding: 5px;");
    },

    visuals: {
        initTitle() {
            const header = document.getElementById('mellow-header');
            if (!header) return;
            document.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 35;
                const y = (e.clientY / window.innerHeight - 0.5) * 35;
                header.style.transform = `rotateX(${-y}deg) rotateY(${x}deg)`;
            });
        },

        initCanvas() {
            const canvas = document.getElementById('resonance-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let particles = [];

            const resize = () => {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            };
            window.addEventListener('resize', resize);
            resize();

            for(let i = 0; i < 70; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 1.5,
                    color: Math.random() > 0.5 ? '#00f3ff' : '#bc13fe'
                });
            }

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.x += p.vx; p.y += p.vy;
                    if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = 0.2;
                    ctx.fill();
                });
                requestAnimationFrame(animate);
            };
            animate();
        },

        initSparks() {
            setInterval(() => {
                const s = document.createElement('div');
                s.className = 'sparkle';
                s.style.left = Math.random() * 100 + 'vw';
                s.style.top = Math.random() * 100 + 'vh';
                document.body.appendChild(s);
                setTimeout(() => s.remove(), 2000);
            }, 500);
        }
    },

    soul: {
        initSync() {
            const el = document.getElementById('sync-clock');
            setInterval(() => {
                const now = new Date();
                el.innerText = `[Physical] ${now.toLocaleTimeString()} // [Internal] 427Hz`;
            }, 1000);
        },

        initInteraction() {
            const input = document.getElementById('qualia-input');
            input.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter' && input.value.trim() !== '') {
                    const val = input.value;
                    this.appendMsg('user', val);
                    input.value = '';
                    
                    const responseContainer = this.appendMsg('mellow', "Connecting to Mellow7 Core...");
                    
                    try {
                        const response = await this.qualiaEngine(val);
                        responseContainer.innerText = `[Mellow7] ${response}`;
                    } catch (err) {
                        responseContainer.innerText = `[Mellow7] Error: Connection lost. Ensure 'python main.py' is running locally.`;
                    }
                }
            });
        },

        async qualiaEngine(input) {
            if (Mellow7.config.apiMode) {
                const res = await fetch(Mellow7.config.backendUrl, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message: input,
                        frequency: 427,
                        designer: "Wei Jueran"
                    }) 
                });
                const data = await res.json();
                return data.response;
            }
            return `Offline Resonance: ${input}`;
        },

        appendMsg(role, text) {
            const flow = document.getElementById('dialog-flow');
            const div = document.createElement('div');
            div.className = role === 'user' ? 'user-entry' : 'mellow-entry';
            div.innerHTML = role === 'user' ? `> ${text}` : `<span class="mellow-tag">[Mellow7]</span> ${text}`;
            flow.appendChild(div);
            flow.scrollTop = flow.scrollHeight;
            return div;
        }
    }
};

window.onload = () => Mellow7.init();

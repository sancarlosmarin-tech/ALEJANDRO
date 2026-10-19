document.documentElement.classList.add("con-js");

/* =========================================
   CARRUSEL DE PROYECTOS
========================================= */

(function carrusel() {
    const contenedor = document.getElementById("carrusel");
    const pista = document.getElementById("pista");
    const btnPrev = document.getElementById("prev");
    const btnNext = document.getElementById("next");
    const puntos = document.getElementById("puntos");
    const seccion = document.getElementById("proyectos");
    const slides = Array.from(pista.children);

    const INTERVALO = 5000;
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let indice = 0;
    let porVista = 3;
    let maxIndice = 0;
    let timer = null;
    let pausado = false;

    function calcular() {
        porVista = parseInt(getComputedStyle(seccion).getPropertyValue("--por-vista"), 10) || 1;
        maxIndice = Math.max(0, slides.length - porVista);
        indice = Math.min(indice, maxIndice);
        construirPuntos();
        mover();
    }

    function construirPuntos() {
        puntos.innerHTML = "";
        for (let i = 0; i <= maxIndice; i++) {
            const b = document.createElement("button");
            b.className = "punto";
            b.type = "button";
            b.setAttribute("role", "tab");
            b.setAttribute("aria-label", "Ir al proyecto " + (i + 1));
            b.addEventListener("click", () => { irA(i); reiniciar(); });
            puntos.appendChild(b);
        }
    }

    function mover() {
        const paso = slides[0].getBoundingClientRect().width +
            parseFloat(getComputedStyle(pista).columnGap || 0);
        pista.style.transform = "translateX(" + (-indice * paso) + "px)";

        Array.from(puntos.children).forEach((p, i) => {
            p.classList.toggle("activo", i === indice);
            p.setAttribute("aria-selected", i === indice);
        });

        btnPrev.disabled = indice === 0;
        btnNext.disabled = indice === maxIndice;

        slides.forEach((s, i) => {
            const visible = i >= indice && i < indice + porVista;
            s.setAttribute("aria-hidden", !visible);
            s.querySelectorAll("a").forEach(a => a.tabIndex = visible ? 0 : -1);
        });
    }

    function irA(i) {
        indice = Math.max(0, Math.min(i, maxIndice));
        mover();
    }

    function siguiente() {
        irA(indice >= maxIndice ? 0 : indice + 1);   // al final vuelve al inicio
    }

    function anterior() {
        irA(indice <= 0 ? maxIndice : indice - 1);
    }

    /* Autoplay */
    function iniciar() {
        if (reducir || maxIndice === 0) return;
        detener();
        timer = setInterval(() => { if (!pausado) siguiente(); }, INTERVALO);
    }

    function detener() { clearInterval(timer); }
    function reiniciar() { detener(); iniciar(); }

    /* Eventos */
    btnNext.addEventListener("click", () => { siguiente(); reiniciar(); });
    btnPrev.addEventListener("click", () => { anterior(); reiniciar(); });

    contenedor.addEventListener("mouseenter", () => pausado = true);
    contenedor.addEventListener("mouseleave", () => pausado = false);
    contenedor.addEventListener("focusin", () => pausado = true);
    contenedor.addEventListener("focusout", () => pausado = false);

    contenedor.tabIndex = 0;
    contenedor.addEventListener("keydown", e => {
        if (e.key === "ArrowRight") { siguiente(); reiniciar(); }
        if (e.key === "ArrowLeft") { anterior(); reiniciar(); }
    });

    /* Deslizar con el dedo o el mouse */
    let inicioX = null;

    pista.addEventListener("pointerdown", e => { inicioX = e.clientX; });
    window.addEventListener("pointerup", e => {
        if (inicioX === null) return;
        const dx = e.clientX - inicioX;
        inicioX = null;
        if (Math.abs(dx) > 50) {
            dx < 0 ? siguiente() : anterior();
            reiniciar();
        }
    });

    /* Solo avanza solo cuando la sección es visible */
    new IntersectionObserver(([entrada]) => {
        pausado = !entrada.isIntersecting;
    }, { threshold: 0.3 }).observe(seccion);

    let redim;
    window.addEventListener("resize", () => {
        clearTimeout(redim);
        redim = setTimeout(calcular, 150);
    });

    calcular();
    iniciar();
})();


/* =========================================
   MENÚ MÓVIL
========================================= */

(function menu() {
    const btn = document.getElementById("menuBtn");
    const nav = document.getElementById("menu");

    function cerrar() {
        nav.classList.remove("abierto");
        btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", () => {
        const abierto = nav.classList.toggle("abierto");
        btn.setAttribute("aria-expanded", abierto);
    });

    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", cerrar));
    document.addEventListener("keydown", e => { if (e.key === "Escape") cerrar(); });
})();


/* =========================================
   LINK ACTIVO SEGÚN LA SECCIÓN
========================================= */

(function navActivo() {
    const enlaces = document.querySelectorAll("nav a");
    const secciones = Array.from(enlaces)
        .map(a => document.querySelector(a.getAttribute("href")))
        .filter(Boolean);

    const obs = new IntersectionObserver(entradas => {
        entradas.forEach(en => {
            if (en.isIntersecting) {
                enlaces.forEach(a =>
                    a.classList.toggle("activo", a.getAttribute("href") === "#" + en.target.id));
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    secciones.forEach(s => obs.observe(s));
})();


/* =========================================
   BARRAS DE HABILIDADES
========================================= */

(function barras() {
    const obs = new IntersectionObserver((entradas, o) => {
        entradas.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add("visible");
                o.unobserve(en.target);
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll(".habilidad").forEach(h => obs.observe(h));
})();


/* =========================================
   FORMULARIO
========================================= */

(function formulario() {
    const form = document.getElementById("formulario");
    const estado = document.getElementById("estado");

    form.addEventListener("submit", e => {
        e.preventDefault();

        const campos = form.querySelectorAll("input, textarea");
        let valido = true;

        campos.forEach(c => {
            const ok = c.checkValidity() && c.value.trim() !== "";
            c.classList.toggle("error", !ok);
            if (!ok) valido = false;
        });

        estado.classList.toggle("error", !valido);

        if (!valido) {
            estado.textContent = "Revisa los campos marcados en rojo.";
            return;
        }

        // Aquí se conectaría un servicio real (Formspree, EmailJS, tu backend...)
        estado.textContent = "¡Gracias! Tu mensaje fue enviado.";
        form.reset();
    });

    form.addEventListener("input", e => e.target.classList.remove("error"));
})();


/* =========================================
   BOTÓN SUBIR Y AÑO DEL FOOTER
========================================= */

(function extras() {
    const subir = document.getElementById("subir");

    window.addEventListener("scroll", () => {
        subir.classList.toggle("visible", window.scrollY > 600);
    }, { passive: true });

    subir.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    document.getElementById("anio").textContent = new Date().getFullYear();
})();


/* =========================================
   EFECTOS Y MOVIMIENTO
========================================= */

const REDUCIR = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ---- Partículas conectadas en el inicio (reaccionan al mouse) ---- */

(function particulas() {
    const cv = document.getElementById("particulas");
    const hero = document.getElementById("inicio");
    if (!cv) return;

    const ctx = cv.getContext("2d");
    const mouse = { x: null, y: null };
    let w, h, ps = [], raf = 0;

    function medir() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = cv.clientWidth;
        h = cv.clientHeight;
        cv.width = w * dpr;
        cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const n = Math.round(Math.min(90, (w * h) / 16000));
        ps = Array.from({ length: n }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 1.8 + 0.8
        }));
    }

    function dibujar() {
        ctx.clearRect(0, 0, w, h);

        for (const p of ps) {
            if (!REDUCIR) { p.x += p.vx; p.y += p.vy; }
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            if (mouse.x !== null) {                       // el mouse las empuja
                const dx = p.x - mouse.x, dy = p.y - mouse.y;
                const d = Math.hypot(dx, dy);
                if (d > 0 && d < 120) { p.x += (dx / d) * 1.4; p.y += (dy / d) * 1.4; }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 40, 40, 0.85)";
            ctx.fill();
        }

        for (let i = 0; i < ps.length; i++) {
            for (let j = i + 1; j < ps.length; j++) {
                const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
                if (d < 130) {
                    ctx.strokeStyle = "rgba(224, 0, 0, " + 0.35 * (1 - d / 130) + ")";
                    ctx.beginPath();
                    ctx.moveTo(ps[i].x, ps[i].y);
                    ctx.lineTo(ps[j].x, ps[j].y);
                    ctx.stroke();
                }
            }
            if (mouse.x !== null) {                       // líneas hacia el mouse
                const d = Math.hypot(ps[i].x - mouse.x, ps[i].y - mouse.y);
                if (d < 160) {
                    ctx.strokeStyle = "rgba(255, 60, 60, " + 0.5 * (1 - d / 160) + ")";
                    ctx.beginPath();
                    ctx.moveTo(ps[i].x, ps[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }

        if (raf && !REDUCIR) raf = requestAnimationFrame(dibujar);
    }

    hero.addEventListener("pointermove", e => {
        const r = cv.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = null; });

    // Solo anima mientras el inicio está visible
    new IntersectionObserver(([en]) => {
        if (en.isIntersecting && !raf) { raf = requestAnimationFrame(dibujar); }
        if (!en.isIntersecting) { cancelAnimationFrame(raf); raf = 0; }
    }).observe(hero);

    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { medir(); if (REDUCIR) dibujar(); }, 150); });

    medir();
    if (REDUCIR) dibujar();
})();


/* ---- Subtítulo que se escribe y se borra ---- */

(function escribe() {
    const el = document.getElementById("escribe");
    if (!el || REDUCIR) return;

    const palabras = ["Desarrollador Web", "Creador de ideas digitales", "Aprendiz de bases de datos"];
    let i = 0, n = palabras[0].length, borrando = false;

    function paso() {
        const p = palabras[i];
        el.textContent = p.slice(0, n);
        let t = borrando ? 35 : 70;

        if (!borrando && n === p.length) { borrando = true; t = 2200; }
        else if (borrando && n === 0) { borrando = false; i = (i + 1) % palabras.length; t = 300; }
        else n += borrando ? -1 : 1;

        setTimeout(paso, t);
    }

    setTimeout(paso, 2500);
})();


/* ---- Ventana de código que se escribe sola ---- */

(function codigo() {
    const el = document.getElementById("codigo");
    if (!el) return;

    const texto =
        'const alejandro = {\n' +
        '  rol: "Desarrollador Web",\n' +
        '  estudia: "ADSO en el SENA",\n' +
        '  tecnologias: ["HTML", "CSS", "JS", "SQL"],\n' +
        '  aprendiendo: true,\n' +
        '};';

    const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const pintar = s => esc(s)
        .replace(/"[^"]*"/g, '<span class="s">$&</span>')
        .replace(/\b(const|true)\b/g, '<span class="k">$1</span>');

    if (REDUCIR) { el.innerHTML = pintar(texto); return; }

    let n = 0;
    function paso() {
        el.innerHTML = pintar(texto.slice(0, n)) + "▌";
        if (n < texto.length) { n++; setTimeout(paso, 45); }
        else { setTimeout(() => { n = 0; paso(); }, 3500); }
    }
    paso();
})();


/* ---- Parallax suave al bajar ---- */

(function parallax() {
    if (REDUCIR) return;
    let esperando = false;

    window.addEventListener("scroll", () => {
        if (esperando) return;
        esperando = true;
        requestAnimationFrame(() => {
            document.documentElement.style.setProperty("--py", Math.min(window.scrollY, 900));
            esperando = false;
        });
    }, { passive: true });
})();


/* ---- Aparición escalonada al hacer scroll ---- */

(function revela() {
    const els = document.querySelectorAll(".titulo, .tarjeta, .habilidad, .cifras, .contacto-info, #formulario, .carrusel");

    const obs = new IntersectionObserver((entradas, o) => {
        entradas.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add("entra");
                o.unobserve(en.target);
            }
        });
    }, { threshold: 0.12 });

    els.forEach(el => {
        const pos = Array.from(el.parentElement.children).indexOf(el);
        el.style.setProperty("--d", (pos % 4) * 0.12 + "s");
        el.classList.add("revela");
        obs.observe(el);
    });
})();


/* ---- Inclinación 3D y luz que sigue al mouse ---- */

(function inclina() {
    if (REDUCIR || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.querySelectorAll(".tarjeta, .proyecto, .habilidad").forEach(el => {
        const inclinar = !el.classList.contains("habilidad");
        const extra = el.classList.contains("tarjeta") ? " translateY(-8px)" : "";

        el.addEventListener("pointermove", e => {
            const r = el.getBoundingClientRect();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            el.style.setProperty("--mx", x + "px");
            el.style.setProperty("--my", y + "px");

            if (inclinar) {
                const rx = (y / r.height - 0.5) * -8;
                const ry = (x / r.width - 0.5) * 8;
                el.style.transform = "perspective(800px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)" + extra;
            }
        });

        el.addEventListener("pointerleave", () => {
            el.style.transform = "";
            el.style.setProperty("--mx", "-999px");
            el.style.setProperty("--my", "-999px");
        });
    });
})();


/* ---- Contadores animados ---- */

(function contadores() {
    document.querySelectorAll(".cifras strong").forEach(el => {
        const fin = parseInt(el.textContent, 10);
        if (isNaN(fin) || String(fin) !== el.textContent.trim() || REDUCIR) return;

        el.textContent = "0";

        new IntersectionObserver(([en], o) => {
            if (!en.isIntersecting) return;
            o.disconnect();
            const inicio = performance.now(), dur = 1200;

            (function tick(ahora) {
                const t = Math.min((ahora - inicio) / dur, 1);
                el.textContent = Math.round(fin * (1 - Math.pow(1 - t, 3)));
                if (t < 1) requestAnimationFrame(tick);
            })(inicio);
        }, { threshold: 0.6 }).observe(el);
    });
})();
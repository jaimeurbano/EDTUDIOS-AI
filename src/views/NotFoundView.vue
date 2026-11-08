<script setup>
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'

const route = useRoute()

const shortcuts = [
  {
    to: '/',
    icon: 'home',
    title: 'Tu panel',
    text: 'Retoma tu meta diaria y mira qué toca hoy.',
  },
  {
    to: '/practicar',
    icon: 'target',
    title: 'Practicar',
    text: 'Lanza un quiz adaptativo de JavaScript, Vue o CSS.',
  },
  {
    to: '/mentor',
    icon: 'chat',
    title: 'Mentor IA',
    text: 'Pregunta lo que se te atragante, sin vergüenza.',
  },
]
</script>

<template>
  <div class="notfound">
    <section class="notfound-hero animate-in">
      <div class="notfound-code" aria-hidden="true">
        <span>4</span>
        <span class="zero">
          <AppIcon name="compass" :size="52" :stroke-width="1.2" />
        </span>
        <span>4</span>
      </div>

      <span class="eyebrow">Error 404</span>
      <h1>Esta ruta no existe… <span class="gradient-text">o aún no la hemos programado.</span></h1>
      <p class="notfound-text">
        Buscaste <code class="route-chip">{{ route.fullPath }}</code> y el router no encontró
        coincidencias. No pasa nada: hasta los mejores developers se pierden en un
        <code>import</code> mal escrito.
      </p>

      <div class="notfound-actions">
        <RouterLink to="/" class="btn btn-primary btn-lg">
          <AppIcon name="home" :size="17" />
          Volver al panel
        </RouterLink>
        <RouterLink to="/practicar" class="btn btn-outline btn-lg">
          <AppIcon name="target" :size="17" />
          Practicar ahora
        </RouterLink>
      </div>

      <div class="notfound-console">
        <div class="console-bar">
          <span class="console-dot" />
          <span class="console-dot" />
          <span class="console-dot" />
          <span class="console-title">router.log</span>
        </div>
        <pre><code><span class="line-num">01</span>  <span class="token-key">const</span> route = <span class="token-fn">findRoute</span>(<span class="token-str">'{{ route.fullPath }}'</span>)
<span class="line-num">02</span>  <span class="token-comment">// → undefined</span>
<span class="line-num">03</span>  <span class="token-fn">redirect</span>(<span class="token-str">'/404'</span>) <span class="token-comment">// pero con estilo ✨</span></code></pre>
      </div>
    </section>

    <section class="shortcuts animate-in delay-2">
      <h2>Quizá querías ir a…</h2>
      <div class="grid grid-3">
        <RouterLink
          v-for="item in shortcuts"
          :key="item.to"
          :to="item.to"
          class="card card-hover shortcut"
        >
          <span class="shortcut-icon"><AppIcon :name="item.icon" :size="19" /></span>
          <strong>{{ item.title }}</strong>
          <p class="small muted">{{ item.text }}</p>
          <span class="shortcut-arrow">
            Ir ahora
            <AppIcon name="arrow-right" :size="14" />
          </span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.notfound {
  max-width: 920px;
  margin: 0 auto;
  padding-top: 14px;
}

.notfound-hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.notfound-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: var(--font-display);
  font-size: clamp(4.5rem, 14vw, 8rem);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.06em;
  margin-bottom: 18px;
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  user-select: none;
}

.notfound-code .zero {
  display: grid;
  place-items: center;
  width: clamp(4.5rem, 14vw, 8rem);
  height: clamp(4.5rem, 14vw, 8rem);
  border-radius: 50%;
  border: 2px dashed rgba(124, 245, 196, 0.4);
  color: var(--brand);
  background: rgba(124, 245, 196, 0.05);
  animation: float 6s ease-in-out infinite;
}

.notfound-code .zero svg {
  color: var(--brand);
}

.notfound-hero h1 {
  max-width: 20ch;
  font-size: clamp(1.6rem, 3.6vw, 2.4rem);
}

.notfound-text {
  max-width: 58ch;
  margin-top: 14px;
  color: var(--muted);
  font-size: 0.92rem;
}

.route-chip {
  word-break: break-all;
}

.notfound-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
}

.notfound-console {
  width: min(560px, 100%);
  margin-top: 34px;
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  background: #070b14;
  text-align: left;
  box-shadow: var(--shadow);
}

.console-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 13px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--border);
}

.console-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
}

.console-dot:first-child {
  background: rgba(251, 113, 133, 0.6);
}

.console-dot:nth-child(2) {
  background: rgba(251, 191, 36, 0.6);
}

.console-dot:nth-child(3) {
  background: rgba(52, 211, 153, 0.6);
}

.console-title {
  margin-left: 6px;
  font-family: var(--font-mono);
  font-size: 0.64rem;
  color: var(--muted-2);
}

.notfound-console pre {
  margin: 0;
  padding: 15px 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.76rem;
  line-height: 1.8;
  color: #c9d7f2;
}

.notfound-console code {
  background: none;
  border: 0;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

.line-num {
  color: var(--muted-2);
}

.token-key {
  color: #c4b5fd;
}

.token-fn {
  color: #7dd3fc;
}

.token-str {
  color: #7cf5c4;
}

.token-comment {
  color: var(--muted-2);
}

.shortcuts {
  margin-top: 46px;
}

.shortcuts h2 {
  text-align: center;
  font-size: 1.15rem;
  margin-bottom: 16px;
}

.shortcut {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 20px;
  color: var(--text);
  text-decoration: none;
}

.shortcut:hover {
  text-decoration: none;
}

.shortcut-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: rgba(124, 245, 196, 0.1);
  color: var(--brand);
  margin-bottom: 3px;
}

.shortcut strong {
  font-family: var(--font-display);
  font-size: 0.95rem;
}

.shortcut p {
  line-height: 1.5;
}

.shortcut-arrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--brand);
}

@media (max-width: 760px) {
  .notfound {
    padding-top: 4px;
  }

  .shortcuts {
    margin-top: 36px;
  }

  .notfound-actions .btn {
    width: 100%;
  }
}
</style>

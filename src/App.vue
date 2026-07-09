<script setup lang="ts">
import { provide } from "vue";
import { useApiTest } from "./composables/useApiTest";
import RequestPanel from "./components/RequestPanel.vue";
import ResponsePanel from "./components/ResponsePanel.vue";
import HistoryPanel from "./components/HistoryPanel.vue";

const api = useApiTest();
provide("api", api);
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Worker 接口验证工具</h1>
      <p class="subtitle">向 Worker API 发送请求并验证返回数据（注意：需要满足科学上网哈）</p>
    </header>

    <main class="main">
      <RequestPanel />
      <ResponsePanel />
      <HistoryPanel />
    </main>
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
}

.app {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.5rem;
  color: #38bdf8;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: #1e293b;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #334155;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #38bdf8;
  color: #0f172a;
}

.btn-primary:hover:not(:disabled) {
  background: #7dd3fc;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-green {
  background: #14532d;
  color: #86efac;
}

.badge-red {
  background: #450a0a;
  color: #fca5a5;
}

.badge-yellow {
  background: #451a03;
  color: #fbbf24;
}

.hidden {
  display: none !important;
}
</style>
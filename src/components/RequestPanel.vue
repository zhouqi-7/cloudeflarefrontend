<script setup lang="ts">
import { inject } from "vue";

const api = inject<ReturnType<typeof import("../composables/useApiTest").useApiTest>>("api")!;

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";
const presets = [
  { label: "/api/data", url: `${apiBase}/api/data` },
  { label: "/api/hello", url: `${apiBase}/api/hello` },
  { label: "/ (根路由)", url: apiBase },
];

function applyPreset(urlStr: string) {
  api.url.value = urlStr;
  api.sendRequest();
}
</script>

<template>
  <div class="card">
    <div class="card-title">请求配置</div>
    <div class="input-row">
      <input
        v-model="api.url.value"
        type="url"
        class="url-input"
        placeholder="输入 API URL..."
        @keydown.enter="api.sendRequest()"
      />
      <button class="btn btn-primary" :disabled="api.loading.value" @click="api.sendRequest()">
        {{ api.loading.value ? "⏳ 请求中..." : "🚀 发送请求" }}
      </button>
    </div>
    <div class="presets">
      <button
        v-for="p in presets"
        :key="p.url"
        class="btn btn-secondary btn-sm"
        @click="applyPreset(p.url)"
      >
        {{ p.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-row {
  display: flex;
  gap: 0.5rem;
}

.url-input {
  flex: 1;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.875rem;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  outline: none;
  transition: border-color 0.2s;
}

.url-input:focus {
  border-color: #38bdf8;
}

.presets {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}
</style>
", "filePath": "D:\\AI\\projects\\cloudeflare-pro\\frontend\\src\\components\\RequestPanel.vue"}
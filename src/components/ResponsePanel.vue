<script setup lang="ts">
import { inject, ref } from "vue";
import type { AssertRule } from "../types";

const api = inject<ReturnType<typeof import("../composables/useApiTest").useApiTest>>("api")!;

const activeTab = ref<"raw" | "validated" | "schema">("raw");
const newAssertType = ref<AssertRule["type"]>("hasKey");
const newAssertPath = ref("");

function syntaxHighlight(json: unknown): string {
  const str = JSON.stringify(json, null, 2);
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(\"(?:[^\"\\\\]|\\.)*\")\s*:/g, '<span class="key">$1</span>:')
    .replace(/:\s*\"(?:[^\"\\\\]|\\.)*\"/g, (m) => `<span class="string">${m}</span>`)
    .replace(/:\s*\d+\.?\d*/g, (m) => `<span class="number">${m}</span>`)
    .replace(/:\s*(true|false)/g, (m) => `<span class="boolean">${m}</span>`)
    .replace(/:\s*null/g, (m) => `<span class="null">${m}</span>`);
}

function inferSchema(data: unknown, path = "response"): string {
  if (data === null) return `${path}: null`;
  if (Array.isArray(data)) {
    if (data.length === 0) return `${path}: [] (空数组)`;
    const itemTypes = [...new Set(data.map((item) => (Array.isArray(item) ? "array" : typeof item)))];
    return `${path}: array[${itemTypes.join("|")}] (length: ${data.length})`;
  }
  if (typeof data === "object") {
    return Object.entries(data as Record<string, unknown>)
      .map(([k, v]) => inferSchema(v, `${path}.${k}`))
      .join("\n");
  }
  return `${path}: ${typeof data}`;
}

function addAssert() {
  const labels: Record<AssertRule["type"], string> = {
    exists: "response 存在",
    status200: "状态码 = 200",
    hasKey: `包含字段: ${newAssertPath.value || "?"}`,
    notEmpty: `${newAssertPath.value || "response"} 不为空`,
    isArray: `${newAssertPath.value || "response"} 是数组`,
    isObject: `${newAssertPath.value || "response"} 是对象`,
  };
  api.addAssert({
    type: newAssertType.value,
    path: newAssertPath.value.trim(),
    label: labels[newAssertType.value],
  });
  newAssertPath.value = "";
}

const statusBadgeClass = (status: number) =>
  status >= 200 && status < 300 ? "badge-green" : status >= 400 ? "badge-red" : "badge-yellow";
</script>

<template>
  <div v-if="api.lastResponse.value" class="card">
    <div class="response-meta">
      <span>
        状态码:
        <span class="badge" :class="statusBadgeClass(api.lastResponse.value.status)">
          {{ api.lastResponse.value.status }}
        </span>
      </span>
      <span>耗时: {{ api.lastResponse.value.time }}s</span>
      <span>类型: {{ api.lastResponse.value.contentType || "—" }}</span>
      <span>
        大小:
        {{ api.lastResponse.value.contentLength ? api.formatBytes(api.lastResponse.value.contentLength) : "—" }}
      </span>
      <span
        v-if="api.validationSummary.value"
        :style="{ color: api.validationSummary.value.allPassed ? '#86efac' : '#fca5a5' }"
      >
        验证: {{ api.validationSummary.value.passed }}/{{ api.validationSummary.value.total }} 通过
      </span>
    </div>

    <div class="tabs">
      <button
        v-for="tab in (['raw', 'validated', 'schema'] as const)"
        :key="tab"
        :class="['tab', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ { raw: "原始数据", validated: "验证结果", schema: "类型推断" }[tab] }}
      </button>
    </div>

    <div v-show="activeTab === 'raw'" class="tab-content raw-content">
      <pre v-html="syntaxHighlight(api.lastResponse.value.data)"></pre>
    </div>

    <div v-show="activeTab === 'validated'" class="tab-content">
      <div
        v-for="r in api.validationResults.value"
        :key="r.index"
        :class="['assert-row', r.pass ? 'assert-pass' : 'assert-fail']"
      >
        <span class="assert-icon">{{ r.pass ? "✅" : "❌" }}</span>
        <code style="flex: 1">{{ r.label }}</code>
        <span class="assert-detail">{{ r.detail }}</span>
        <button
          v-if="r.index !== 0"
          class="btn btn-secondary btn-sm"
          @click="api.removeAssert(r.index)"
        >
          ✕
        </button>
      </div>
      <div class="add-assert">
        <span class="add-label">添加断言:</span>
        <select v-model="newAssertType" class="assert-select">
          <option value="status200">状态码 = 200</option>
          <option value="hasKey">包含字段</option>
          <option value="notEmpty">不为空</option>
          <option value="isArray">是数组</option>
          <option value="isObject">是对象</option>
        </select>
        <input
          v-model="newAssertPath"
          type="text"
          placeholder="字段路径 (如 data.items)"
          class="assert-path-input"
        />
        <button class="btn btn-secondary btn-sm" @click="addAssert">+ 添加</button>
      </div>
    </div>

    <div v-show="activeTab === 'schema'" class="tab-content">
      <pre>{{ inferSchema(api.lastResponse.value.data) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.response-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #94a3b8;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #334155;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  cursor: pointer;
  color: #94a3b8;
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #e2e8f0;
}

.tab.active {
  color: #38bdf8;
  border-bottom-color: #38bdf8;
}

.tab-content {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
}

.raw-content pre {
  background: #0f172a;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.raw-content pre :deep(.string) {
  color: #86efac;
}
.raw-content pre :deep(.number) {
  color: #fbbf24;
}
.raw-content pre :deep(.boolean) {
  color: #67e8f9;
}
.raw-content pre :deep(.null) {
  color: #94a3b8;
  font-style: italic;
}
.raw-content pre :deep(.key) {
  color: #f472b6;
}

.tab-content pre {
  background: #0f172a;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.assert-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #1e293b;
  font-size: 0.8125rem;
}

.assert-row:last-child {
  border-bottom: none;
}

.assert-pass {
  color: #86efac;
}

.assert-fail {
  color: #fca5a5;
}

.assert-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
}

.assert-detail {
  font-size: 0.75rem;
  color: #94a3b8;
}

.add-assert {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.add-label {
  color: #94a3b8;
  font-size: 0.8125rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.assert-select,
.assert-path-input {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.8125rem;
  font-family: inherit;
}

.assert-path-input {
  width: 200px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
}
</style>
", "filePath": "D:\\AI\\projects\\cloudeflare-pro\\frontend\\src\\components\\ResponsePanel.vue"}
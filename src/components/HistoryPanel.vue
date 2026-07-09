<script setup lang="ts">
import { inject } from "vue";

const api = inject<ReturnType<typeof import("../composables/useApiTest").useApiTest>>("api")!;

function statusBadgeClass(status: number) {
  return status >= 200 && status < 300
    ? "badge-green"
    : status >= 400
      ? "badge-red"
      : "badge-yellow";
}
</script>

<template>
  <div class="card">
    <div class="card-title">请求历史</div>

    <div v-if="api.history.value.length === 0" class="empty-state">
      <p>暂无请求记录</p>
    </div>

    <div v-else>
      <div
        v-for="(h, i) in api.history.value"
        :key="i"
        class="history-item"
        @click="api.loadFromHistory(h)"
      >
        <span class="history-url">{{ h.method }} {{ h.url }}</span>
        <span class="badge" :class="statusBadgeClass(h.status)">{{ h.status }}</span>
        <span class="history-time">{{ h.time }}</span>
      </div>
      <button class="btn btn-secondary btn-sm" style="margin-top: 0.5rem" @click="api.clearHistory()">
        清除历史
      </button>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #64748b;
  font-size: 0.875rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8125rem;
  transition: background 0.2s;
}

.history-item:hover {
  background: #334155;
}

.history-url {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  color: #94a3b8;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  color: #64748b;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}
</style>
", "filePath": "D:\\AI\\projects\\cloudeflare-pro\\frontend\\src\\components\\HistoryPanel.vue"}
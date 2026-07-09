import { ref, computed } from "vue";
import type { AssertRule, AssertResult, ApiResponse, HistoryItem } from "../types";

function getValueByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split(/[.,/]/).reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === "object" && part in acc) return (acc as Record<string, unknown>)[part];
    return undefined;
  }, obj);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem("workerTestHistory") || "[]");
  } catch {
    return [];
  }
}

export function useApiTest() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";
const url = ref(`${apiBase}/api/data`);
  const loading = ref(false);
  const lastResponse = ref<ApiResponse | null>(null);
  const asserts = ref<AssertRule[]>([{ type: "exists", path: "", label: "response 存在" }]);
  const history = ref<HistoryItem[]>(loadHistory());

  const validationResults = computed<AssertResult[]>(() => {
    if (!lastResponse.value) return [];
    const data = lastResponse.value.data;
    return asserts.value.map((a, i) => {
      let pass = false;
      let detail = "";
      switch (a.type) {
        case "exists":
          pass = data !== undefined && data !== null;
          detail = pass ? "✓ 响应已接收" : "✗ 无响应数据";
          break;
        case "status200":
          pass = lastResponse.value!.status === 200;
          detail = pass ? "✓ 状态码 = 200" : `✗ 状态码 = ${lastResponse.value!.status}`;
          break;
        case "hasKey": {
          const val = getValueByPath(data, a.path);
          pass = val !== undefined;
          detail = pass ? `✓ ${a.path} 存在` : `✗ ${a.path} 不存在`;
          break;
        }
        case "notEmpty": {
          const val = getValueByPath(data, a.path);
          pass = val !== undefined && val !== null && val !== "" && !(Array.isArray(val) && val.length === 0);
          detail = pass ? `✓ ${a.path || "response"} 不为空` : `✗ ${a.path || "response"} 为空`;
          break;
        }
        case "isArray": {
          const val = getValueByPath(data, a.path);
          pass = Array.isArray(val);
          detail = pass ? `✓ ${a.path || "response"} 是数组` : `✗ ${a.path || "response"} 不是数组`;
          break;
        }
        case "isObject": {
          const val = getValueByPath(data, a.path);
          pass = val !== null && typeof val === "object" && !Array.isArray(val);
          detail = pass ? `✓ ${a.path || "response"} 是对象` : `✗ ${a.path || "response"} 不是对象`;
          break;
        }
      }
      return { pass, label: a.label, detail, index: i };
    });
  });

  const validationSummary = computed(() => {
    const results = validationResults.value;
    if (!results.length) return null;
    const passed = results.filter((r) => r.pass).length;
    const total = results.length;
    return { passed, total, allPassed: passed === total };
  });

  async function sendRequest() {
    if (!url.value.trim()) return;
    loading.value = true;
    const start = performance.now();

    try {
      const resp = await fetch(url.value.trim());
      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      const contentType = resp.headers.get("content-type") || "";
      let data: unknown;
      if (contentType.includes("json")) {
        data = await resp.json();
      } else {
        data = await resp.text();
      }

      lastResponse.value = {
        status: resp.status,
        statusText: resp.statusText,
        contentType,
        contentLength: Number(resp.headers.get("content-length")) || new Blob([JSON.stringify(data)]).size,
        data,
        time: elapsed,
      };

      saveHistory(url.value.trim(), resp.status, `${elapsed}s`, lastResponse.value);
    } catch (err) {
      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      const errorResp: ApiResponse = {
        status: 0,
        statusText: "Network Error",
        contentType: "",
        contentLength: 0,
        data: { error: (err as Error).message },
        time: elapsed,
      };
      lastResponse.value = errorResp;
      saveHistory(url.value.trim(), 0, `${elapsed}s`, errorResp);
    } finally {
      loading.value = false;
    }
  }

  function saveHistory(urlStr: string, status: number, time: string, resp: ApiResponse) {
    history.value.unshift({
      url: urlStr,
      status,
      time,
      method: "GET",
      response: { ...resp },
    });
    if (history.value.length > 20) history.value.pop();
    localStorage.setItem("workerTestHistory", JSON.stringify(history.value));
  }

  function clearHistory() {
    history.value = [];
    localStorage.removeItem("workerTestHistory");
  }

  function loadFromHistory(item: HistoryItem) {
    url.value = item.url;
    lastResponse.value = item.response;
  }

  function addAssert(rule: AssertRule) {
    asserts.value.push(rule);
  }

  function removeAssert(index: number) {
    if (index === 0) return;
    asserts.value.splice(index, 1);
  }

  return {
    url,
    loading,
    lastResponse,
    asserts,
    history,
    validationResults,
    validationSummary,
    formatBytes,
    sendRequest,
    clearHistory,
    loadFromHistory,
    addAssert,
    removeAssert,
  };
}
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { apiFetch, triggerBrowserDownload } from "@/lib/utils";
import { useI18n } from "@/lib/i18n-context";
import { TaskLogPanel } from "@/components/tasks/TaskLogPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Copy,
  Download,
  ExternalLink,
  Gauge,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";

/**
 * GPT Plus 统一管理页
 * ----------------------------------------------------------------
 * CTF 生成 GPTPlus 和 GoPay 生成 GPTPlus 两条线生成的 Plus 账号都落在
 * accounts 表 platform=chatgpt，这里统一拉取并管理：搜索 / 状态徽章 /
 * 导出 / 刷新配额（plus/free） / 绑定手机号 / Codex OAuth。
 *
 * 绑定手机号 + Codex OAuth 复用 CtfGptPlus 页同名功能（``/api/tasks/phone-bind``
 * 与 ``/api/tasks/codex-oauth``），仅拷贝 UI 与状态机，不改后端协议。
 */

function getAccountOverview(acc: any) {
  return acc?.overview && typeof acc.overview === "object" ? acc.overview : {};
}
function getDisplaySummary(acc: any) {
  return acc?.display_summary && typeof acc.display_summary === "object"
    ? acc.display_summary
    : {};
}
function getPlanState(acc: any) {
  return (
    getDisplaySummary(acc)?.status?.plan_state ||
    acc?.plan_state ||
    acc?.overview?.plan_state ||
    "unknown"
  );
}
function getPlanName(acc: any) {
  return getAccountOverview(acc)?.plan_name || acc?.plan_name || "";
}
function getCashierUrl(acc: any) {
  return acc?.cashier_url || getAccountOverview(acc)?.cashier_url || "";
}
function getPaidVia(acc: any) {
  return getAccountOverview(acc)?.paid_via || "";
}
function isPhoneBound(acc: any) {
  const binding = getAccountOverview(acc)?.phone_binding;
  return Boolean(
    binding && typeof binding === "object" && binding.status === "bound",
  );
}

function isPlusAccount(acc: any) {
  const overview = getAccountOverview(acc);
  const chips = Array.isArray(overview?.chips) ? overview.chips.join(" ") : "";
  const planText = [
    getPlanState(acc),
    getPlanName(acc),
    overview?.plan,
    overview?.membership_type,
    chips,
  ]
    .join(" ")
    .toLowerCase();
  if (planText.includes("plus") || planText.includes("team")) return true;
  if (getPlanState(acc) === "subscribed") return true;
  if (getCashierUrl(acc)) return true;
  if (planText.includes("free") || planText.includes("expired")) return true;
  return false;
}

function planBadge(acc: any): { label: string; variant: any } {
  const ps = String(getPlanState(acc)).toLowerCase();
  const overview = getAccountOverview(acc);
  const chips = Array.isArray(overview?.chips)
    ? overview.chips.join(" ").toLowerCase()
    : "";
  if (ps === "subscribed" || chips.includes("plus")) return { label: "Plus", variant: "success" };
  if (chips.includes("team")) return { label: "Team", variant: "success" };
  if (ps === "expired" || chips.includes("expired")) return { label: "Expired", variant: "warning" };
  if (ps === "free" || chips.includes("free")) return { label: "Free", variant: "secondary" };
  return { label: ps || "unknown", variant: "secondary" };
}

function escapeCsv(v: any): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function PlusManager() {
  const { t } = useI18n();
  const browserModeOptions = useMemo(
    () => [
      { value: "camoufox_headed", label: t("ctfGptPlus.camoufoxForeground") },
      { value: "camoufox_headless", label: t("ctfGptPlus.camoufoxBackground") },
      { value: "bitbrowser_headed", label: t("ctfGptPlus.bitbrowserHeaded") },
      { value: "bitbrowser_hidden", label: t("ctfGptPlus.bitbrowserHidden") },
      { value: "bitbrowser_headless", label: t("ctfGptPlus.bitbrowserHeadless") },
    ],
    [t],
  );
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");
  const [error, setError] = useState("");
  const [bindFilter, setBindFilter] = useState<"all" | "bound" | "unbound">(
    "all",
  );

  // 绑定手机号
  const [showBind, setShowBind] = useState(false);
  const [phoneLines, setPhoneLines] = useState("");
  const [binding, setBinding] = useState(false);
  const [bindTaskId, setBindTaskId] = useState("");
  const [bindResult, setBindResult] = useState<any>(null);

  // Codex OAuth
  const [browserMode, setBrowserMode] = useState("camoufox_headed");
  const [actionConcurrency, setActionConcurrency] = useState(1);
  const [oauthTaskId, setOauthTaskId] = useState("");
  const [oauthModal, setOauthModal] = useState<any>(null);
  const [oauthCallbackUrl, setOauthCallbackUrl] = useState("");
  const [oauthBusy, setOauthBusy] = useState(false);
  const [oauthConfirmOpen, setOauthConfirmOpen] = useState(false);

  const load = useCallback(async (s = debouncedSearch) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        platform: "chatgpt",
        page: "1",
        page_size: "200",
      });
      if (s) params.set("email", s);
      const data = await apiFetch(`/accounts?${params}`);
      const items = (data.items || []).filter(isPlusAccount);
      setAccounts(items);
    } catch (exc: any) {
      setError(exc?.message || t("plusManager.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, t]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    load(debouncedSearch);
  }, [debouncedSearch, load]);

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((acc) => {
        if (bindFilter === "all") return true;
        if (bindFilter === "bound") return isPhoneBound(acc);
        return !isPhoneBound(acc);
      }),
    [accounts, bindFilter],
  );

  // 切换搜索 / 过滤后清理掉不再可见账户的勾选状态
  useEffect(() => {
    const visibleIds = new Set(filteredAccounts.map((acc) => Number(acc.id)));
    setSelectedIds(
      (current) => new Set([...current].filter((id) => visibleIds.has(id))),
    );
  }, [filteredAccounts]);

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const pageIds = filteredAccounts.map((a) => Number(a.id));
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const togglePage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const copy = (text: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
  };

  const exportCsv = () => {
    const header = "email,password,plan_state,plan_name,paid_via,cashier_url,created_at";
    const src =
      selectedIds.size > 0
        ? filteredAccounts.filter((a) => selectedIds.has(Number(a.id)))
        : filteredAccounts;
    const rows = src.map((a) =>
      [
        a.email,
        a.password,
        getPlanState(a),
        getPlanName(a),
        getPaidVia(a),
        getCashierUrl(a),
        a.created_at,
      ]
        .map(escapeCsv)
        .join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    triggerBrowserDownload(blob, "gpt_plus_accounts.csv");
  };

  const refreshQuota = async () => {
    const ids =
      selectedIds.size > 0 ? [...selectedIds] : filteredAccounts.map((a) => Number(a.id));
    if (ids.length === 0) return;
    setRefreshing(true);
    setRefreshMsg("");
    setError("");
    try {
      const res = await apiFetch("/accounts/refresh-plan?platform=chatgpt", {
        method: "POST",
        body: JSON.stringify({ ids }),
      });
      const updated = res?.updated ?? res?.success ?? 0;
      const timedOut = res?.timed_out ?? 0;
      setRefreshMsg(t("plusManager.refreshedSummary", {
        updated,
        total: ids.length,
        timeout: timedOut ? t("plusManager.refreshTimeoutSuffix", { count: timedOut }) : "",
      }));
      await load();
    } catch (err: any) {
      setRefreshMsg(t("plusManager.refreshFailed", { message: err?.message || String(err) }));
    } finally {
      setRefreshing(false);
    }
  };

  // ---- 绑定手机号 -----------------------------------------------------------
  const startPhoneBind = async () => {
    setError("");
    const ids = [...selectedIds];
    const fallbackIds = filteredAccounts
      .filter((acc) => !isPhoneBound(acc))
      .map((acc) => Number(acc.id));
    if (!phoneLines.trim()) {
      setError(t("plusManager.phoneLinesRequired"));
      return;
    }
    if (ids.length === 0 && fallbackIds.length === 0) {
      setError(t("plusManager.noUnboundAccounts"));
      return;
    }
    setBinding(true);
    try {
      const result = await apiFetch("/tasks/phone-bind", {
        method: "POST",
        body: JSON.stringify({
          platform: "chatgpt",
          ids,
          fallback_ids: ids.length > 0 ? [] : fallbackIds,
          phone_lines: phoneLines,
          browser_mode: browserMode,
          concurrency: Math.max(Number(actionConcurrency || 1), 1),
        }),
      });
      setBindTaskId(result.task_id || result.id || "");
    } catch (exc: any) {
      setError(exc?.message || t("plusManager.submitFailed"));
      setBinding(false);
    }
  };

  const handleBindTaskDone = useCallback(async () => {
    if (!bindTaskId) return;
    setBinding(false);
    try {
      const task = await apiFetch(`/tasks/${bindTaskId}`);
      const result = task?.result?.data || task?.data;
      if (result) setBindResult(result);
      setShowBind(false);
      setBindTaskId("");
      setPhoneLines("");
      setSelectedIds(new Set());
      await load();
    } catch {
      await load();
    }
  }, [bindTaskId, load]);

  // ---- Codex OAuth ----------------------------------------------------------
  const startCodexOAuth = async () => {
    setError("");
    const ids = [...selectedIds];
    if (ids.length === 0) {
      setError(t("plusManager.selectCodexAccounts"));
      return;
    }
    setOauthBusy(true);
    try {
      const data = await apiFetch("/tasks/codex-oauth", {
        method: "POST",
        body: JSON.stringify({
          platform: "chatgpt",
          ids,
          browser_mode: browserMode,
          concurrency: Math.max(Number(actionConcurrency || 1), 1),
        }),
      });
      setOauthTaskId(data.task_id || data.id || "");
    } catch (exc: any) {
      setError(exc?.message || t("plusManager.submitFailed"));
    } finally {
      setOauthBusy(false);
    }
  };

  const handleOAuthTaskDone = useCallback(async () => {
    setOauthBusy(false);
    setSelectedIds(new Set());
    await load();
  }, [load]);

  const completeCodexOAuth = async () => {
    if (!oauthModal?.account_id || !oauthCallbackUrl.trim()) return;
    setOauthBusy(true);
    setError("");
    try {
      await apiFetch(`/accounts/${oauthModal.account_id}/codex-oauth/complete`, {
        method: "POST",
        body: JSON.stringify({ callback_url: oauthCallbackUrl.trim() }),
      });
      setOauthModal(null);
      setOauthCallbackUrl("");
      setSelectedIds(new Set());
      await load();
    } catch (exc: any) {
      setError(exc?.message || t("plusManager.submitFailed"));
    } finally {
      setOauthBusy(false);
    }
  };

  const counts = useMemo(() => {
    let plus = 0,
      free = 0,
      expired = 0,
      bound = 0;
    for (const a of accounts) {
      const b = planBadge(a).label.toLowerCase();
      if (b === "plus" || b === "team") plus++;
      else if (b === "free") free++;
      else if (b === "expired") expired++;
      if (isPhoneBound(a)) bound++;
    }
    return { plus, free, expired, bound };
  }, [accounts]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      {/* 绑定手机号弹窗 */}
      {showBind &&
        createPortal(
          <div
            className="dialog-backdrop"
            onClick={() => !binding && setShowBind(false)}
          >
            <div
              className="dialog-panel flex max-h-[80vh] flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    {t("plusManager.bindPhone")}
                  </h2>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">
                    {t("plusManager.bindPhoneDesc", { count: selectedIds.size })}
                  </div>
                </div>
                <button
                  onClick={() => !binding && setShowBind(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 px-6 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t("common.browserMode")}
                    <select
                      value={browserMode}
                      onChange={(event) => setBrowserMode(event.target.value)}
                      disabled={binding}
                      className="control-surface control-surface-compact mt-1 w-full"
                    >
                      {browserModeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t("common.concurrency")}
                    <input
                      type="number"
                      min={1}
                      value={actionConcurrency}
                      onChange={(event) =>
                        setActionConcurrency(
                          Math.max(Number(event.target.value || 1), 1),
                        )
                      }
                      disabled={binding}
                      className="control-surface control-surface-compact mt-1 w-full text-center"
                    />
                  </label>
                </div>
                {browserMode.startsWith("bitbrowser_") && (
                  <div className="rounded border border-[var(--border)] bg-[var(--bg-pane)] px-3 py-2 text-xs text-[var(--text-muted)]">
                    {t("plusManager.bitbrowserPoolHint")}
                  </div>
                )}
                <textarea
                  value={phoneLines}
                  onChange={(event) => setPhoneLines(event.target.value)}
                  rows={7}
                  spellCheck={false}
                  disabled={binding}
                  placeholder="7857019646----https://mail-api.yuecheng.shop/api/sms/recordText?key=..."
                  className="control-surface control-surface-compact w-full font-mono text-xs leading-relaxed"
                />
                <p className="text-xs text-[var(--text-muted)]">
                  {t("plusManager.phoneBindHelp")}
                </p>
                {bindTaskId && (
                  <div className="h-[360px] min-h-0 rounded border border-[var(--border)] p-3">
                    <TaskLogPanel taskId={bindTaskId} onDone={handleBindTaskDone} />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--border)] px-6 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBind(false)}
                  disabled={binding}
                >
                  {t("common.close")}
                </Button>
                <Button size="sm" onClick={startPhoneBind} disabled={binding}>
                  {binding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Smartphone className="mr-2 h-4 w-4" />
                  )}
                  {t("plusManager.startBind")}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* 绑定结果弹窗 */}
      {bindResult &&
        createPortal(
          <div className="dialog-backdrop" onClick={() => setBindResult(null)}>
            <div
              className="dialog-panel"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  {t("plusManager.bindResult")}
                </h2>
                <button
                  onClick={() => setBindResult(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 px-6 py-4 text-sm">
                <div className="text-[var(--text-secondary)]">
                  {t("plusManager.successFailure", {
                    success: bindResult.success_count || 0,
                    failure: bindResult.failure_count || 0,
                  })}
                </div>
                <div className="overflow-hidden rounded border border-[var(--border)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--bg-pane)] text-[var(--text-muted)]">
                      <tr>
                        <th className="px-3 py-2">{t("common.phone")}</th>
                        <th className="px-3 py-2">{t("plusManager.used")}</th>
                        <th className="px-3 py-2">{t("plusManager.success")}</th>
                        <th className="px-3 py-2">{t("plusManager.failed")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(bindResult.phones || []).map((item: any) => (
                        <tr
                          key={item.phone}
                          className="border-t border-[var(--border)]/40"
                        >
                          <td className="px-3 py-2 font-mono">{item.phone}</td>
                          <td className="px-3 py-2">{item.used || 0}</td>
                          <td className="px-3 py-2">{item.success || 0}</td>
                          <td className="px-3 py-2">{item.failed || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end border-t border-[var(--border)] px-6 py-3">
                <Button size="sm" onClick={() => setBindResult(null)}>
                  {t("common.close")}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Codex OAuth 任务日志弹窗 */}
      {oauthTaskId &&
        createPortal(
          <div className="dialog-backdrop" onClick={() => setOauthTaskId("")}>
            <div
              className="dialog-panel flex max-h-[82vh] flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Codex OAuth
                  </h2>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">
                    {t("plusManager.oauthTaskDesc")}
                  </div>
                </div>
                <button
                  onClick={() => setOauthTaskId("")}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 px-6 py-4">
                <div className="h-[420px] min-h-0 rounded border border-[var(--border)] p-3">
                  <TaskLogPanel taskId={oauthTaskId} onDone={handleOAuthTaskDone} />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--border)] px-6 py-3">
                <Button variant="outline" size="sm" onClick={() => setOauthTaskId("")}>
                  {t("common.close")}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Codex OAuth 单账户回调粘贴弹窗 */}
      {oauthModal &&
        createPortal(
          <div
            className="dialog-backdrop"
            onClick={() => !oauthBusy && setOauthModal(null)}
          >
            <div
              className="dialog-panel flex max-h-[82vh] flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Codex OAuth
                  </h2>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">
                    {t("plusManager.oauthCallbackDesc", { email: oauthModal.email || "" })}
                  </div>
                </div>
                <button
                  onClick={() => !oauthBusy && setOauthModal(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 px-6 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(oauthModal.auth_url, "_blank", "noopener,noreferrer")
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("plusManager.openOauthLink")}
                </Button>
                <textarea
                  value={oauthCallbackUrl}
                  onChange={(event) => setOauthCallbackUrl(event.target.value)}
                  rows={6}
                  spellCheck={false}
                  placeholder={t("plusManager.oauthCallbackPlaceholder")}
                  className="control-surface control-surface-compact w-full font-mono text-xs leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--border)] px-6 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOauthModal(null)}
                  disabled={oauthBusy}
                >
                  {t("common.close")}
                </Button>
                <Button
                  size="sm"
                  onClick={completeCodexOAuth}
                  disabled={oauthBusy || !oauthCallbackUrl.trim()}
                >
                  {oauthBusy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  {t("plusManager.refreshToken")}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Codex OAuth 启动选项弹窗 */}
      {oauthConfirmOpen &&
        createPortal(
          <div
            className="dialog-backdrop"
            onClick={() => !oauthBusy && setOauthConfirmOpen(false)}
          >
            <div
              className="dialog-panel flex max-h-[82vh] flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    {t("plusManager.oauthStartOptions")}
                  </h2>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">
                    {t("plusManager.oauthStartDesc", { count: selectedIds.size })}
                  </div>
                </div>
                <button
                  onClick={() => !oauthBusy && setOauthConfirmOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4 px-6 py-4">
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">
                    {t("common.browserMode")}
                  </label>
                  <select
                    value={browserMode}
                    onChange={(event) => setBrowserMode(event.target.value)}
                    className="control-surface control-surface-compact w-full"
                  >
                    {browserModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">
                    {t("common.concurrency")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={actionConcurrency}
                    onChange={(event) =>
                      setActionConcurrency(
                        Math.max(Number(event.target.value || 1), 1),
                      )
                    }
                    className="control-surface control-surface-compact w-full text-center"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--border)] px-6 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOauthConfirmOpen(false)}
                  disabled={oauthBusy}
                >
                  {t("common.close")}
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    setOauthConfirmOpen(false);
                    await startCodexOAuth();
                  }}
                  disabled={oauthBusy || selectedIds.size === 0}
                >
                  {oauthBusy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  {t("common.start")}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* 顶部工具栏 */}
      <Card className="shrink-0 bg-[var(--bg-pane)]/40 border border-[var(--border)] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border)]/50">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {t("plusManager.title")}
            </h1>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[var(--text-muted)]">{t("plusManager.totalRows", { count: accounts.length })}</span>
              {counts.plus > 0 && (
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 font-medium text-blue-500 ring-1 ring-inset ring-blue-500/20">
                  Plus {counts.plus}
                </span>
              )}
              {counts.free > 0 && (
                <span className="rounded-full bg-[var(--text-primary)]/10 px-2 py-0.5 font-medium text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--text-primary)]/20">
                  Free {counts.free}
                </span>
              )}
              {counts.expired > 0 && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                  Expired {counts.expired}
                </span>
              )}
              {counts.bound > 0 && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                  {t("plusManager.boundCount", { count: counts.bound })}
                </span>
              )}
              {selectedIds.size > 0 && (
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-medium text-[var(--accent)]">
                  {t("common.selectedCount", { count: selectedIds.size })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.searchEmail")}
              className="control-surface control-surface-compact h-8"
              style={{ width: 240 }}
            />
            <Button size="sm" variant="outline" onClick={() => load()} disabled={loading} className="h-8">
              {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
              {t("common.refresh")}
            </Button>
            <Button size="sm" variant="outline" onClick={refreshQuota} disabled={refreshing} className="h-8">
              {refreshing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Gauge className="mr-1.5 h-3.5 w-3.5" />}
              {t("plusManager.refreshQuota")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBind(true)}
              className="h-8"
            >
              <Smartphone className="mr-1.5 h-3.5 w-3.5" />
              {t("plusManager.bindPhone")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setError("");
                if (selectedIds.size === 0) {
                  setError(t("plusManager.selectCodexAccounts"));
                  return;
                }
                setOauthConfirmOpen(true);
              }}
              disabled={oauthBusy || selectedIds.size === 0}
              className="h-8"
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Codex OAuth
            </Button>
            <Button size="sm" onClick={exportCsv} className="h-8">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {t("plusManager.exportCsv")}
            </Button>
          </div>
        </div>

        {/* 过滤条 + 状态条 */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-2 text-xs">
          {(["all", "bound", "unbound"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={bindFilter === value ? "default" : "outline"}
              onClick={() => setBindFilter(value)}
              className="h-7"
            >
              {value === "all" ? t("common.all") : value === "bound" ? t("common.bound") : t("common.unbound")}
            </Button>
          ))}
          {refreshMsg && (
            <span className="text-[var(--text-muted)]">{refreshMsg}</span>
          )}
          {error && (
            <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-red-300">
              {error}
            </span>
          )}
        </div>
      </Card>

      <Card className="flex flex-col min-h-0 flex-1 bg-[var(--bg-pane)]/40 border border-[var(--border)]">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[var(--bg-card)] z-10">
              <tr className="text-left text-[var(--text-muted)]">
                <th className="px-3 py-2 w-8">
                  <input type="checkbox" checked={allSelected} onChange={togglePage} className="h-4 w-4 accent-[var(--accent)]" />
                </th>
                <th className="px-3 py-2">{t("common.email")}</th>
                <th className="px-3 py-2">{t("plusManager.tablePlan")}</th>
                <th className="px-3 py-2">{t("common.phone")}</th>
                <th className="px-3 py-2">{t("common.source")}</th>
                <th className="px-3 py-2">{t("plusManager.tablePaymentLink")}</th>
                <th className="px-3 py-2">{t("common.createdAt")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc) => {
                const badge = planBadge(acc);
                const cashier = getCashierUrl(acc);
                const paidVia = getPaidVia(acc);
                const phoneBound = isPhoneBound(acc);
                return (
                  <tr key={acc.id} className="hover:bg-[var(--bg-hover)]">
                    <td className="px-3 py-1.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(Number(acc.id))}
                        onChange={() => toggleOne(Number(acc.id))}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                    </td>
                    <td className="px-3 py-1.5 text-[var(--text-primary)]">
                      <button
                        onClick={() => copy(acc.email)}
                        className="inline-flex items-center gap-1 hover:text-[var(--accent)]"
                        title={t("plusManager.copyEmail")}
                      >
                        {acc.email}
                        <Copy className="h-3 w-3 opacity-50" />
                      </button>
                    </td>
                    <td className="px-3 py-1.5">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="px-3 py-1.5">
                      {phoneBound ? (
                        <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] text-emerald-300">
                          {t("plusManager.phoneBound")}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">-</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-[var(--text-muted)]">
                      {paidVia === "gopay" ? "GoPay" : "CTF"}
                    </td>
                    <td className="px-3 py-1.5 text-[var(--text-muted)]">
                      {cashier ? (
                        <a href={cashier} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
                          {t("plusManager.link")}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-[var(--text-muted)]">{acc.created_at || "-"}</td>
                  </tr>
                );
              })}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[var(--text-muted)]">
                    {loading ? t("common.loading") : t("plusManager.noPlusAccounts")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

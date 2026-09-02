"use client";

import { useSyncExternalStore, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function PushOptIn() {
  const isClient = useIsClient();
  const supported =
    isClient &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isClient || !supported) return null;

  const permissionGranted = Notification.permission === "granted";
  const isSubscribed = subscribed || permissionGranted;

  const subscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("सूचना अनुमति अस्वीकार गरियो");
        return;
      }

      const keyRes = await fetch("/api/push/vapid-public-key");
      const keyJson = await keyRes.json();
      const publicKey = keyJson.data?.publicKey as string | null;

      if (!publicKey) {
        toast.error("Push alerts are not configured on this site yet");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const subJson = subscription.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
          breakingOnly: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to subscribe");

      setSubscribed(true);
      toast.success("ब्रेकिङ समाचार सूचना सक्रिय भयो");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Push subscription failed");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      toast.success("सूचना बन्द गरियो");
    } catch {
      toast.error("Failed to unsubscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-none border border-slate-700 bg-slate-900/50 p-3">
      <p className="mb-2 text-xs font-semibold text-white">ब्रेकिङ न्यूज अलर्ट</p>
      <p className="mb-3 text-[11px] text-slate-400">
        तत्काल ब्रेकिङ समाचारको पुश सूचना पाउनुहोस्
      </p>
      {isSubscribed ? (
        <button
          type="button"
          onClick={unsubscribe}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-none border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
        >
          <BellOff className="h-3.5 w-3.5" />
          सूचना बन्द गर्नुहोस्
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void subscribe()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-none bg-[#027081] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#025f6b]"
        >
          <Bell className="h-3.5 w-3.5" />
          {loading ? "सक्रिय गर्दै…" : "सूचना सक्रिय गर्नुहोस्"}
        </button>
      )}
    </div>
  );
}

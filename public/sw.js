self.addEventListener("push", (event) => {
  let data = { title: "Echo Manch", body: "नयाँ समाचार", url: "/" };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    // use defaults
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/newslogo.png",
      badge: "/newslogo.png",
      data: { url: data.url },
      tag: data.tag || "nepal-khabar-alert",
    })
  );
});

function sameOriginUrl(candidate, origin) {
  try {
    const url = new URL(candidate || "/", origin);
    if (url.origin !== origin) return origin + "/";
    return url.href;
  } catch {
    return origin + "/";
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const origin = self.location.origin;
  const url = sameOriginUrl(event.notification.data?.url, origin);
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

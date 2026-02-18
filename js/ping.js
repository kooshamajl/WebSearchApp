async function pingFetch() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const start = performance.now();

        await fetch(
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
            {
                cache: "no-store",
                mode: "no-cors",
                signal: controller.signal
            }
        );

        const end = performance.now();
        clearTimeout(timeout);

        return Math.round(end - start);
    } catch (e) {
        return "Offline";
    }
}

function getColor(ping) {
    if (typeof ping !== "number") return "#777";
    if (ping < 150) return "#00ff9d";
    if (ping < 300) return "#f9d000";
    return "#ff5b5b";
}

function getStatus(ping) {
    if (typeof ping !== "number") return "Offline";
    if (ping < 100) return "Excellent";
    if (ping < 300) return "Normal";
    return "Bad";
}

function getIcon(ping) {
    if (typeof ping !== "number") return "fa-solid fa-wifi-slash";
    if (ping < 100) return "fa-solid fa-wifi";
    if (ping < 300) return "fa-solid fa-wifi";
    return "fa-solid fa-wifi";
}

async function updatePing() {
    const el = document.getElementById("pingValue");
    const icon = document.getElementById("pingIcon");
    const status = document.getElementById("pingStatus");

    if (!el || !icon || !status) return;

    const ping = await pingFetch();

    if (typeof ping === "number") {
        const safePing = Math.min(ping, 999);

        el.textContent = safePing + " ms";
        status.textContent = getStatus(safePing);
        icon.className = getIcon(safePing);

        const color = getColor(safePing);
        el.style.color = color;
        el.style.opacity = 0.9;
        icon.style.color = color;
        icon.style.opacity = 0.7;
        status.style.color = color;
        status.style.opacity = 0.8;
    } 
    else {
        el.textContent = "Offline";
        status.textContent = "Disconnected";
        icon.className = getIcon(ping);
        el.style.color = "#777";
        icon.style.color = "#777";
        status.style.color = "#777";
    }

    el.classList.remove("ping-animate");
    void el.offsetWidth;
    el.classList.add("ping-animate");
}

document.addEventListener("DOMContentLoaded", () => {
    updatePing();
    setInterval(updatePing, 4000);
});

    /* Redes sociales: lee SITE_DATA.socials (siteData → socials). Solo muestra redes con URL válida. */
    (function () {
      try {
        var D = typeof SITE_DATA !== "undefined" ? SITE_DATA : null;
        var band = document.getElementById("redes");
        var list = document.getElementById("redes-lista");
        if (!D || !band || !list || !Array.isArray(D.socials)) return;

        var NETWORKS = {
          instagram: { hosts: ["instagram.com"], name: "Instagram", icon: "M7.03.084c-1.277.06-2.149.264-2.91.563a5.9 5.9 0 0 0-2.124 1.388 5.9 5.9 0 0 0-1.38 2.127C.321 4.926.12 5.8.064 7.076s-.069 1.688-.063 4.947.021 3.667.083 4.947c.061 1.277.264 2.149.563 2.911.308.789.72 1.457 1.388 2.123a5.9 5.9 0 0 0 2.129 1.38c.763.295 1.636.496 2.913.552 1.278.056 1.689.069 4.947.063s3.668-.021 4.947-.082c1.28-.06 2.147-.265 2.91-.563a5.9 5.9 0 0 0 2.123-1.388 5.9 5.9 0 0 0 1.38-2.129c.295-.763.496-1.636.551-2.912.056-1.28.07-1.69.063-4.948-.006-3.258-.02-3.667-.081-4.947-.06-1.28-.264-2.148-.564-2.911a5.9 5.9 0 0 0-1.387-2.123 5.86 5.86 0 0 0-2.128-1.38C19.074.322 18.202.12 16.924.066 15.647.009 15.236-.006 11.977 0S8.31.021 7.03.084m.14 21.693c-1.17-.05-1.805-.245-2.228-.408a3.7 3.7 0 0 1-1.382-.895 3.7 3.7 0 0 1-.9-1.378c-.165-.423-.363-1.058-.417-2.228-.06-1.264-.072-1.644-.08-4.848-.006-3.204.006-3.583.061-4.848.05-1.169.246-1.805.408-2.228.216-.561.477-.96.895-1.382a3.7 3.7 0 0 1 1.379-.9c.423-.165 1.057-.361 2.227-.417 1.265-.06 1.644-.072 4.848-.08 3.203-.006 3.583.006 4.85.062 1.168.05 1.804.244 2.227.408.56.216.96.475 1.382.895s.681.817.9 1.378c.165.422.362 1.056.417 2.227.06 1.265.074 1.645.08 4.848.005 3.203-.006 3.583-.061 4.848-.051 1.17-.245 1.805-.408 2.23-.216.56-.477.96-.896 1.38a3.7 3.7 0 0 1-1.378.9c-.422.165-1.058.362-2.226.418-1.266.06-1.645.072-4.85.079s-3.582-.006-4.848-.06m9.783-16.192a1.44 1.44 0 1 0 1.437-1.442 1.44 1.44 0 0 0-1.437 1.442M5.839 12.012a6.161 6.161 0 1 0 12.323-.024 6.162 6.162 0 0 0-12.323.024M8 12.008A4 4 0 1 1 12.008 16 4 4 0 0 1 8 12.008" },
          facebook:  { hosts: ["facebook.com", "fb.com", "fb.me"], name: "Facebook", icon: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a9 9 0 0 1 1.141.195v3.325a9 9 0 0 0-.653-.036 27 27 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.7 1.7 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647" },
          tiktok:    { hosts: ["tiktok.com"], name: "TikTok", icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07" }
        };

        function validUrl(raw, net) {
          if (typeof raw !== "string" || !raw.trim()) return null;
          var u;
          try { u = new URL(raw.trim()); } catch (e) { return null; }
          if (u.protocol !== "https:") return null;
          var host = u.hostname.toLowerCase().replace(/^www\./, "");
          var ok = net.hosts.some(function (h) { return host === h || host.slice(-(h.length + 1)) === "." + h; });
          return ok ? u.href : null;
        }

        D.socials.forEach(function (s) {
          if (!s || !s.url) return;
          var key = String(s.label || "").toLowerCase().trim();
          var net = NETWORKS[key];
          if (!net) return;
          var href = validUrl(s.url, net);
          if (!href) { console.warn("Redes sociales: la URL de " + net.name + " no es válida y no se mostrará."); return; }

          var li = document.createElement("li");
          var a = document.createElement("a");
          a.className = "btn btn--outline";
          a.setAttribute("data-net", key);
          a.href = href;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.setAttribute("aria-label", net.name + " de la Fundación CJNH (se abre en una pestaña nueva)");
          var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("aria-hidden", "true");
          svg.setAttribute("focusable", "false");
          var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", net.icon);
          svg.appendChild(path);
          a.appendChild(svg);
          a.appendChild(document.createTextNode(net.name));
          li.appendChild(a);
          list.appendChild(li);
        });

        if (list.children.length) {
          band.hidden = false;
          var old = document.getElementById("contacto-redes"); // evita duplicar los enlaces en Contacto
          if (old && old.parentNode) old.parentNode.removeChild(old);
        }
      } catch (err) { console.error("Redes sociales:", err); }
    })();
  

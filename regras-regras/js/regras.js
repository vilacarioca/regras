const $ = (id) => document.getElementById(id);
const normChar = (c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const norm = (value) => Array.from(String(value || ""), normChar).join("");

const chapters = Array.from(document.querySelectorAll(".chapter"));
const tocLinks = Array.from(document.querySelectorAll(".toc a"));
const linkFor = (chapter) => tocLinks.find((a) => a.getAttribute("href") === "#" + chapter.id);
const chapterText = new Map(chapters.map((c) => [c, norm(c.textContent)]));
const canHighlight = typeof CSS !== "undefined" && CSS.highlights && typeof Highlight !== "undefined";

// Marca cada ocorrência da busca sem alterar o HTML (CSS Custom Highlight API).
function marcar(query, roots) {
  if (!canHighlight) return;
  CSS.highlights.delete("busca");
  if (!query) return;
  const ranges = [];
  roots.forEach((root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.nodeValue;
      let flat = "";
      const map = [];
      Array.from(text).forEach((c, i) => { const n = normChar(c); flat += n; for (let k = 0; k < n.length; k++) map.push(i); });
      for (let at = flat.indexOf(query); at !== -1; at = flat.indexOf(query, at + query.length)) {
        const range = new Range();
        range.setStart(node, map[at]);
        range.setEnd(node, map[at + query.length - 1] + 1);
        ranges.push(range);
      }
    }
  });
  if (ranges.length) CSS.highlights.set("busca", new Highlight(...ranges));
}

function buscar() {
  const query = norm($("search").value.trim());
  const found = chapters.filter((c) => !query || chapterText.get(c).includes(query));
  chapters.forEach((c) => {
    const visible = found.includes(c);
    c.hidden = !visible;
    linkFor(c).classList.toggle("dim", !!query && !visible);
  });
  $("empty-state").hidden = found.length > 0;
  $("search-status").textContent = query ? `${found.length} ${found.length === 1 ? "capítulo encontrado" : "capítulos encontrados"}` : "";
  marcar(query, found);
}

$("search").addEventListener("input", buscar);
$("search").addEventListener("keydown", (event) => { if (event.key === "Escape") { $("search").value = ""; buscar(); } });
$("reset-search").addEventListener("click", () => { $("search").value = ""; buscar(); $("search").focus(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) { event.preventDefault(); $("search").focus(); }
});

// Capítulo atual em destaque no índice, rolando o índice para ele ficar visível.
function mostrarNoIndice(link) {
  const box = document.querySelector(".sidebar");
  if (box.scrollHeight <= box.clientHeight) return;
  const top = link.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
  if (top < box.scrollTop + 60 || top > box.scrollTop + box.clientHeight - 60) {
    box.scrollTo({ top: top - box.clientHeight / 2, behavior: "smooth" });
  }
}
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const link = linkFor(entry.target);
    tocLinks.forEach((a) => a.classList.toggle("active", a === link));
    mostrarNoIndice(link);
  });
}, { rootMargin: "-25% 0px -65% 0px" });
chapters.forEach((c) => observer.observe(c));

// Índice recolhível no celular.
const sidebar = document.querySelector(".sidebar");
$("toc-toggle").addEventListener("click", () => {
  const open = sidebar.classList.toggle("open");
  $("toc-toggle").setAttribute("aria-expanded", String(open));
});
tocLinks.forEach((a) => a.addEventListener("click", () => {
  if (!$("search").value) return closeToc();
  $("search").value = ""; buscar(); closeToc();
}));
function closeToc() { sidebar.classList.remove("open"); $("toc-toggle").setAttribute("aria-expanded", "false"); }

async function copiarTexto(text) {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  let copied = false;
  try { copied = document.execCommand("copy"); } catch (_) { /* browser without legacy copy */ }
  input.remove();
  return copied;
}

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    let ok = false;
    try { ok = await copiarTexto($(button.dataset.copy).textContent); } catch (_) { ok = false; }
    button.textContent = ok ? "Copiado" : "Não copiou";
    button.dataset.state = ok ? "ok" : "";
    setTimeout(() => { button.textContent = "Copiar"; button.dataset.state = ""; }, 1800);
  });
});

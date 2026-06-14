const contactEmail = "snackeriado@lps-company.com";
const whatsappNumber = "";

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      document.body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
  if (whatsappNumber) {
    link.href = `https://wa.me/${whatsappNumber}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = link.textContent.replace("por configurar", whatsappNumber);
  } else {
    link.setAttribute("aria-disabled", "true");
    link.title = "Agrega el numero de WhatsApp en script.js";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelector("#empresas")?.scrollIntoView({ behavior: "smooth" });
    });
  }
});

function readStoredRecords(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveRecord(key, record) {
  const records = readStoredRecords(key);
  records.push(record);
  localStorage.setItem(key, JSON.stringify(records));
}

document.querySelectorAll("[data-mail-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const values = [...formData.entries()]
      .filter(([, value]) => String(value).trim())
      .map(([key, value]) => [key, String(value).trim()]);

    const recordType = form.dataset.recordType || "contacto";
    const record = {
      id: `${recordType}-${Date.now()}`,
      type: recordType,
      createdAt: new Date().toISOString(),
      values: Object.fromEntries(values),
    };

    const storageKey = form.dataset.storageKey || "snackeriaContactos";
    saveRecord(storageKey, record);

    const lines = [
      `ID: ${record.id}`,
      `Fecha: ${record.createdAt}`,
      `Tipo: ${record.type}`,
      "",
      ...values.map(([key, value]) => `${key}: ${value}`),
    ];

    const subject = form.dataset.subject || "Contacto Snackeria";
    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = mailto;
  });
});

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  document.body.classList.add("js-ready");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px 160px", threshold: 0.01 }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

window.addEventListener("load", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

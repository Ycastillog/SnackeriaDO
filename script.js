const contactEmail = "snackeriado@lps-company.com";
const formEndpoint = `https://formsubmit.co/ajax/${contactEmail}`;
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
    link.hidden = false;
    link.href = `https://wa.me/${whatsappNumber}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = link.textContent.replace("por configurar", whatsappNumber);
  } else {
    link.hidden = true;
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

function findReplyEmail(values) {
  const emailField = values.find(([key]) => key.toLowerCase().includes("correo"));
  return emailField ? emailField[1] : "";
}

async function sendFormToEmail({ values, subject, record }) {
  const payload = new FormData();
  payload.append("_subject", subject);
  payload.append("_template", "table");
  payload.append("_captcha", "false");
  payload.append("ID", record.id);
  payload.append("Fecha de registro", record.createdAt);
  payload.append("Tipo", record.type);

  const replyEmail = findReplyEmail(values);
  if (replyEmail) {
    payload.append("_replyto", replyEmail);
  }

  values.forEach(([key, value]) => {
    payload.append(key, value);
  });

  const response = await fetch(formEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: payload,
  });

  if (!response.ok) {
    throw new Error("No se pudo enviar el formulario.");
  }
}

document.querySelectorAll("[data-mail-form]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
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

    const status = form.querySelector(".form-status");
    const submitButton = form.querySelector(".form-submit");
    if (status) {
      status.hidden = false;
      status.textContent = recordType === "incidencia"
        ? "Enviando incidencia a soporte..."
        : "Enviando solicitud a Snackeria...";
    }

    const subject = form.dataset.subject || "Contacto Snackeria";

    try {
      if (submitButton) {
        submitButton.disabled = true;
      }

      await sendFormToEmail({ values, subject, record });

      if (status) {
        status.textContent = recordType === "incidencia"
          ? "Incidencia enviada. Nuestro equipo de soporte le dará seguimiento."
          : "Solicitud enviada. Nuestro equipo revisará la ubicación.";
      }

      form.reset();
    } catch {
      if (status) {
        status.textContent = "No pudimos enviar el formulario ahora mismo. El reporte quedó guardado localmente; intenta nuevamente en unos minutos.";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
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

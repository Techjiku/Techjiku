const menuToggle = document.getElementById("menuToggle");
const primaryNav = document.getElementById("primaryNav");
const openContactsButtons = document.querySelectorAll("#openContacts, #openContactsSecondary, #openContactsFooter");
const closeContacts = document.getElementById("closeContacts");
const contactsDrawer = document.getElementById("contactsDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const inquiryForm = document.getElementById("inquiryForm");
const formStatus = document.getElementById("formStatus");
const currentYear = document.getElementById("currentYear");
const heroArt = document.getElementById("heroArt");
let lastFocusedElement;

function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  primaryNav.classList.toggle("open", isOpen);
}

function openDrawer() {
  lastFocusedElement = document.activeElement;
  contactsDrawer.classList.add("open");
  contactsDrawer.setAttribute("aria-hidden", "false");
  contactsDrawer.inert = false;
  drawerBackdrop.hidden = false;
  document.body.classList.add("drawer-open");
  closeContacts.focus();
}

function closeDrawer() {
  contactsDrawer.classList.remove("open");
  contactsDrawer.setAttribute("aria-hidden", "true");
  contactsDrawer.inert = true;
  drawerBackdrop.hidden = true;
  document.body.classList.remove("drawer-open");
  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

function setFormStatus(message, state) {
  formStatus.textContent = message;
  formStatus.dataset.state = state;
}

async function submitForm(event) {
  event.preventDefault();

  const submitButton = inquiryForm.querySelector('button[type="submit"]');
  const submitLabel = submitButton.querySelector(".submit-label");
  const originalLabel = submitLabel.textContent;

  submitButton.disabled = true;
  submitLabel.textContent = "Sending...";
  setFormStatus("", "");

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: new FormData(inquiryForm),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "The message could not be sent. Please try again.");
    }

    inquiryForm.reset();
    setFormStatus("Thanks — your message has been sent. We’ll be in touch soon.", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong while sending your message.";
    setFormStatus(`${message} You can also email us at jikutech@gmail.com.`, "error");
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = originalLabel;
  }
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

primaryNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

openContactsButtons.forEach((button) => button.addEventListener("click", openDrawer));
closeContacts.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDrawer();
    setMenuOpen(false);
  }
});

inquiryForm.addEventListener("submit", submitForm);
currentYear.textContent = String(new Date().getFullYear());

if (heroArt && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const sphereDepth = document.getElementById("sphereDepth");
  let pointerFrame = 0;

  function resetSphere() {
    window.cancelAnimationFrame(pointerFrame);
    heroArt.classList.remove("is-hovered");
    heroArt.style.setProperty("--sphere-x", "0deg");
    heroArt.style.setProperty("--sphere-y", "0deg");
    heroArt.style.setProperty("--sphere-shift-x", "0px");
    heroArt.style.setProperty("--sphere-shift-y", "0px");
    heroArt.style.setProperty("--sphere-glow-x", "50%");
    heroArt.style.setProperty("--sphere-glow-y", "50%");
    heroArt.style.setProperty("--sphere-scale", "1");
  }

  heroArt.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;

    window.cancelAnimationFrame(pointerFrame);
    pointerFrame = window.requestAnimationFrame(() => {
      const bounds = heroArt.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const horizontal = (x - 0.5) * 2;
      const vertical = (y - 0.5) * 2;
      const depth = 1 - Math.min(Math.hypot(horizontal, vertical) / Math.SQRT2, 1);

      heroArt.classList.add("is-hovered");
      heroArt.style.setProperty("--sphere-y", `${horizontal * 17}deg`);
      heroArt.style.setProperty("--sphere-x", `${vertical * -17}deg`);
      heroArt.style.setProperty("--sphere-shift-x", `${horizontal * 9}px`);
      heroArt.style.setProperty("--sphere-shift-y", `${vertical * 9}px`);
      heroArt.style.setProperty("--sphere-glow-x", `${x * 100}%`);
      heroArt.style.setProperty("--sphere-glow-y", `${y * 100}%`);
      heroArt.style.setProperty("--sphere-scale", `${1 + depth * 0.012}`);
    });
  });

  heroArt.addEventListener("pointerleave", resetSphere);
  heroArt.addEventListener("pointercancel", resetSphere);

  heroArt.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") {
      heroArt.classList.add("is-hovered");
    }
  });

  sphereDepth.addEventListener("transitionend", (event) => {
    if (event.propertyName === "transform" && !heroArt.matches(":hover")) {
      resetSphere();
    }
  });
}

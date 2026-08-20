(() => {
  const header = document.getElementById("siteHeader");
  const mobileToggle = document.getElementById("mobileToggle");
  const mobileNav = document.getElementById("mobileNav");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (mobileToggle && mobileNav) {
    const closeMenu = () => {
      mobileToggle.classList.remove("is-open");
      mobileNav.classList.remove("is-open");
      mobileToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };

    mobileToggle.addEventListener("click", () => {
      const open = mobileToggle.classList.toggle("is-open");
      mobileNav.classList.toggle("is-open", open);
      mobileToggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((item) => {
      item.addEventListener("mousemove", (event) => {
        const rect = item.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        item.style.transform = `translate(${x * 0.05}px, ${y * 0.08}px)`;
      });

      item.addEventListener("mouseleave", () => {
        item.style.transform = "";
      });
    });
  }
})();

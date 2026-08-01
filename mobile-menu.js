window.addEventListener("DOMContentLoaded", () => {
  const headers = document.querySelectorAll(".topbar");

  headers.forEach((header) => {
    const menuButton = header.querySelector(".menu-toggle");
    const nav = header.querySelector(".nav-actions");

    if (!menuButton || !nav) {
      return;
    }

    const closeMenu = () => {
      header.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    };

    menuButton.addEventListener("click", () => {
      const isOpen = header.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 640) {
        closeMenu();
      }
    });
  });
});

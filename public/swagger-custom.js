(() => {
  const POSTMAN_COLLECTION_ENDPOINT = "/postman-collection";
  const BUTTON_ID = "download-postman-button";

  const createButton = () => {
    const topbar = document.querySelector(".topbar");
    if (!topbar || topbar.querySelector(`#${BUTTON_ID}`)) {
      return;
    }

    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.className = "download-postman-button";
    button.type = "button";
    button.textContent = "Descargar colección Postman";
    button.addEventListener("click", () => {
      window.open(POSTMAN_COLLECTION_ENDPOINT, "_blank");
    });

    const topbarWrapper = topbar.querySelector(".topbar-wrapper");
    if (topbarWrapper) {
      topbarWrapper.appendChild(button);
      return;
    }

    topbar.appendChild(button);
  };

  window.addEventListener("load", () => {
    createButton();

    const observer = new MutationObserver(() => {
      createButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
})();

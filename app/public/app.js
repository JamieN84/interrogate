(function bootstrap() {
  const statusEl = document.getElementById("status");
  const pingButton = document.getElementById("pingButton");

  if (!statusEl || !pingButton) {
    return;
  }

  statusEl.textContent = "Boilerplate loaded. Ready for local serve test.";

  pingButton.addEventListener("click", function onPing() {
    statusEl.textContent = "UI event received at " + new Date().toLocaleTimeString();
  });
})();

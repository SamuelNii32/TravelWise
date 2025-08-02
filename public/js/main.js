document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector(".mobile-menu");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      mobileNav.classList.toggle("open");

      // Toggle icon between hamburger and X
      if (mobileNav.classList.contains("open")) {
        menuButton.textContent = "✕";
      } else {
        menuButton.textContent = "☰";
      }
    });
  }

  // Travel mode and submit button text update
  const travelModeRadios = document.querySelectorAll(
    'input[name="travelMode"]'
  );
  const submitBtn = document.querySelector("button.submit-btn");

  function updateButtonText() {
    const selected = [...travelModeRadios].find((radio) => radio.checked);
    if (selected && selected.value === "companion") {
      submitBtn.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE)
          node.textContent = " Find Companions & Destinations";
      });
    } else {
      submitBtn.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE)
          node.textContent = " Find My Perfect Destinations";
      });
    }
  }

  travelModeRadios.forEach((radio) =>
    radio.addEventListener("change", updateButtonText)
  );

  // Initialize button text on page load
  updateButtonText();

  // Handle interest badge selection
  const interestBadges = document.querySelectorAll(".badge[data-interest]");
  const selectedInterests = new Set();
  const interestsInput = document.getElementById("interests");

  interestBadges.forEach((badge) => {
    badge.addEventListener("click", function () {
      const interest = this.getAttribute("data-interest");

      if (this.classList.contains("selected")) {
        // Deselect
        this.classList.remove("selected");
        selectedInterests.delete(interest);
      } else {
        // Select
        this.classList.add("selected");
        selectedInterests.add(interest);
      }

      // Update hidden input
      if (interestsInput) {
        interestsInput.value = Array.from(selectedInterests).join(",");
      }

      console.log("Selected interests:", Array.from(selectedInterests));
    });
  });
});

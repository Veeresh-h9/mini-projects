// Simple Coin Flip Application
class SimpleCoinFlip {
  constructor() {
    this.isFlipping = false;

    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.coin = document.getElementById("coin");
    this.flipBtn = document.getElementById("flipBtn");
    this.resultText = document.getElementById("resultText");
  }

  bindEvents() {
    this.flipBtn.addEventListener("click", () => this.handleFlip());
    this.coin.addEventListener("click", () => this.handleFlip());
  }

  async handleFlip() {
    if (this.isFlipping) return;

    this.isFlipping = true;
    this.flipBtn.disabled = true;
    this.hideResult();

    // Start coin animation
    this.coin.classList.add("flipping");

    // Get random result
    const result = Math.random() < 0.5 ? "white" : "black";

    // Wait for animation
    await this.delay(2000);

    // Set final coin position
    this.setCoinPosition(result);

    // Show result
    this.showResult(result);

    // Reset state
    this.coin.classList.remove("flipping");
    this.flipBtn.disabled = false;
    this.isFlipping = false;
  }

  setCoinPosition(result) {
    if (result === "black") {
      this.coin.style.transform = "rotateY(0deg)";
    } else {
      this.coin.style.transform = "rotateY(180deg)";
    }
  }

  showResult(result) {
    this.resultText.textContent = result === "white" ? "White!" : "Black!";
    this.resultText.className = `result-text show ${result}`;
  }

  hideResult() {
    this.resultText.classList.remove("show", "white", "black");
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SimpleCoinFlip();
});

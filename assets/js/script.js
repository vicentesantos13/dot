const storage = {
  // Wrapper pequeno para centralizar leitura/escrita de sessionStorage.
  get(key, fallback) {
    try {
      const value = window.sessionStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage write errors to keep the page functional.
    }
  },
};

function initSlider() {
  // Inicializa o slider simples de imagens usando translateX no track.
  const slider = document.querySelector("[data-slider]");

  if (!slider) {
    return;
  }

  const track = slider.querySelector(".slider__track");
  const slides = Array.from(slider.querySelectorAll(".slider__slide"));
  const prevButton = slider.querySelector('[data-action="prev"]');
  const nextButton = slider.querySelector('[data-action="next"]');
  const dotsWrapper = slider.querySelector(".slider__dots");
  let currentIndex = 0;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = "slider__dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir para imagem ${index + 1}`);
    dot.addEventListener("click", () => updateSlider(index));
    dotsWrapper.appendChild(dot);
    return dot;
  });

  function updateSlider(index) {
    // Mantém slides, dots e setas sincronizados em um único ponto.
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
      dot.setAttribute("aria-current", dotIndex === currentIndex ? "true" : "false");
    });

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;
  }

  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      updateSlider(currentIndex - 1);
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentIndex < slides.length - 1) {
      updateSlider(currentIndex + 1);
    }
  });

  updateSlider(0);
}

function initExpandableCards() {
  // Faz o toggle visual dos cards expansíveis sem estado global.
  const grid = document.querySelector("[data-expandables]");

  if (!grid) {
    return;
  }

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-toggle-card]");

    if (!button) {
      return;
    }

    const card = button.closest(".expandable-card");
    card.classList.toggle("is-open");
  });
}
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

function initDiscursiveActivity() {
  // Persiste texto, estados dos botões e feedback da atividade discursiva.
  const activity = document.querySelector('[data-activity="discursive"]');

  if (!activity) {
    return;
  }

  const textarea = activity.querySelector('[data-field="answer"]');
  const submitButton = activity.querySelector('[data-action="submit"]');
  const editButton = activity.querySelector('[data-action="edit"]');
  const feedback = activity.querySelector("[data-feedback]");
  const storageKey = "edtech-discursive";

  function render(state) {
    // A UI sempre é derivada do estado persistido, evitando inconsistência visual.
    const hasAnswer = state.answer.trim().length > 0;
    textarea.value = state.answer;
    textarea.disabled = state.submitted;
    submitButton.disabled = state.submitted || !hasAnswer;
    submitButton.classList.toggle("button--dark", !state.submitted && hasAnswer);
    submitButton.classList.toggle("button--disabled", state.submitted || !hasAnswer);
    editButton.hidden = !state.submitted;
    editButton.disabled = !state.submitted;
    editButton.style.display = state.submitted ? "" : "none";
    feedback.hidden = !state.submitted;
  }

  function save(nextState) {
    storage.set(storageKey, nextState);
    render(nextState);
  }

  const state = storage.get(storageKey, {
    answer: "",
    submitted: false,
  });

  textarea.addEventListener("input", () => {
    const nextState = {
      ...storage.get(storageKey, state),
      answer: textarea.value,
      submitted: false,
    };
    save(nextState);
  });

  submitButton.addEventListener("click", () => {
    save({
      answer: textarea.value,
      submitted: true,
    });
  });

  editButton.addEventListener("click", () => {
    save({
      answer: textarea.value,
      submitted: false,
    });
  });

  render(state);
}

function initObjectiveActivity() {
  // A atividade objetiva usa seleção única, mesmo mantendo checkboxes no HTML.
  const activity = document.querySelector('[data-activity="objective"]');

  if (!activity) {
    return;
  }

  const checkboxes = Array.from(activity.querySelectorAll('input[type="checkbox"]'));
  const labels = checkboxes.map((input) => input.closest(".option-card"));
  const submitButton = activity.querySelector('[data-action="submit"]');
  const editButton = activity.querySelector('[data-action="edit"]');
  const feedback = activity.querySelector("[data-feedback]");
  const storageKey = "edtech-objective";
  const correctOption = "c";

  function getCurrentValues() {
    return checkboxes.filter((input) => input.checked).map((input) => input.value);
  }

  function render(state) {
    // O feedback muda de estilo conforme a alternativa correta definida no script.
    const hasSelection = state.selected.length > 0;
    const isCorrect = state.selected.includes(correctOption);

    checkboxes.forEach((input) => {
      input.checked = state.selected.includes(input.value);
      input.disabled = state.submitted;
    });

    labels.forEach((label) => {
      const input = label.querySelector('input[type="checkbox"]');
      label.classList.toggle("is-selected", input.checked);
      label.classList.toggle("is-locked", state.submitted);
    });

    submitButton.disabled = state.submitted || !hasSelection;
    submitButton.classList.toggle("button--dark", !state.submitted && hasSelection);
    submitButton.classList.toggle("button--disabled", state.submitted || !hasSelection);
    editButton.hidden = !state.submitted;
    editButton.disabled = !state.submitted;
    editButton.style.display = state.submitted ? "" : "none";
    feedback.hidden = !state.submitted;
    feedback.classList.toggle("feedback--success", state.submitted && isCorrect);
    feedback.classList.toggle("feedback--warning", state.submitted && !isCorrect);
    feedback.querySelector("strong").textContent = isCorrect
      ? "É isso aí"
      : "Tente novamente!";
    feedback.querySelector("p").textContent = isCorrect
      ? "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Pariatur commodi odio maiores accusamus aspernatur consequatur ipsam dignissimos magnam hic, velit est perferendis explicabo aperiam ratione veritatis labore."
      : "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Pariatur commodi odio maiores accusamus aspernatur consequatur ipsam dignissimos magnam hic, velit est perferendis explicabo aperiam ratione veritatis labore.";
  }

  function save(nextState) {
    storage.set(storageKey, nextState);
    render(nextState);
  }

  const state = storage.get(storageKey, {
    selected: [],
    submitted: false,
  });

  checkboxes.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        checkboxes.forEach((otherInput) => {
          if (otherInput !== input) {
            otherInput.checked = false;
          }
        });
      }

      save({
        selected: getCurrentValues(),
        submitted: false,
      });
    });
  });

  submitButton.addEventListener("click", () => {
    save({
      selected: getCurrentValues(),
      submitted: true,
    });
  });

  editButton.addEventListener("click", () => {
    save({
      selected: getCurrentValues(),
      submitted: false,
    });
  });

  render(state);
}

function initFaq() {
  // O FAQ combina <details> com animação manual para abrir e fechar suavemente.
  const items = Array.from(document.querySelectorAll(".faq__item"));

  function animateOpen(item) {
    // Mede a altura real do conteúdo para evitar saltos na abertura.
    const content = item.querySelector(".faq__content");

    item.open = true;
    content.style.height = "0px";

    requestAnimationFrame(() => {
      content.style.height = `${content.scrollHeight}px`;
    });

    const onEnd = (event) => {
      if (event.propertyName !== "height") {
        return;
      }

      content.style.height = "auto";
      content.removeEventListener("transitionend", onEnd);
    };

    content.addEventListener("transitionend", onEnd);
  }

  function animateClose(item) {
    // Fecha animando da altura atual até zero antes de remover o atributo open.
    const content = item.querySelector(".faq__content");

    content.style.height = `${content.scrollHeight}px`;

    requestAnimationFrame(() => {
      content.style.height = "0px";
    });

    const onEnd = (event) => {
      if (event.propertyName !== "height") {
        return;
      }

      item.open = false;
      content.removeEventListener("transitionend", onEnd);
    };

    content.addEventListener("transitionend", onEnd);
  }

  items.forEach((item) => {
    const summary = item.querySelector("summary");
    const content = item.querySelector(".faq__content");

    content.style.height = item.open ? "auto" : "0px";

    summary.addEventListener("click", (event) => {
      event.preventDefault();

      if (item.open) {
        animateClose(item);
        return;
      }

      items.forEach((otherItem) => {
        if (otherItem !== item && otherItem.open) {
          animateClose(otherItem);
        }
      });

      animateOpen(item);
    });
  });
}
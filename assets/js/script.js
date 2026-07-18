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
      dot.setAttribute(
        "aria-current",
        dotIndex === currentIndex ? "true" : "false",
      );
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
    submitButton.classList.toggle(
      "button--dark",
      !state.submitted && hasAnswer,
    );
    submitButton.classList.toggle(
      "button--disabled",
      state.submitted || !hasAnswer,
    );
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

  const checkboxes = Array.from(
    activity.querySelectorAll('input[type="checkbox"]'),
  );
  const labels = checkboxes.map((input) => input.closest(".option-card"));
  const submitButton = activity.querySelector('[data-action="submit"]');
  const editButton = activity.querySelector('[data-action="edit"]');
  const feedback = activity.querySelector("[data-feedback]");
  const storageKey = "edtech-objective";
  const correctOption = "c";

  function getCurrentValues() {
    return checkboxes
      .filter((input) => input.checked)
      .map((input) => input.value);
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
    submitButton.classList.toggle(
      "button--dark",
      !state.submitted && hasSelection,
    );
    submitButton.classList.toggle(
      "button--disabled",
      state.submitted || !hasSelection,
    );
    editButton.hidden = !state.submitted;
    editButton.disabled = !state.submitted;
    editButton.style.display = state.submitted ? "" : "none";
    feedback.hidden = !state.submitted;
    feedback.classList.toggle(
      "feedback--success",
      state.submitted && isCorrect,
    );
    feedback.classList.toggle(
      "feedback--warning",
      state.submitted && !isCorrect,
    );
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

function initAudioPlayer() {
  // O player customizado usa a tag <audio> real, mas desenha os controles manualmente.
  const player = document.querySelector("[data-audio-player]");

  if (!player) {
    return;
  }

  const audio = player.querySelector("audio");
  const toggleButton = player.querySelector('[data-audio-action="toggle"]');
  const muteButton = player.querySelector('[data-audio-action="mute"]');
  const progress = player.querySelector("[data-audio-progress]");
  const volume = player.querySelector("[data-audio-volume]");
  const time = player.querySelector("[data-audio-time]");

  function formatTime(totalSeconds) {
    const safeSeconds = Number.isFinite(totalSeconds)
      ? Math.floor(totalSeconds)
      : 0;
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const seconds = String(safeSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function updateRangeFill(input, value, max) {
    // Atualiza a trilha visual dos ranges via CSS custom property.
    const percentage = max > 0 ? (value / max) * 100 : 0;
    input.style.setProperty("--range-progress", `${percentage}%`);
  }

  function syncProgress() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    progress.max = duration || 100;
    progress.value = String(audio.currentTime);
    updateRangeFill(progress, audio.currentTime, duration || 100);
    time.textContent = formatTime(audio.currentTime);
  }

  function syncVolume() {
    const effectiveVolume = audio.muted ? 0 : audio.volume;
    volume.value = String(audio.volume);
    updateRangeFill(volume, effectiveVolume, 1);
    muteButton.setAttribute(
      "aria-label",
      effectiveVolume === 0 ? "Ativar volume" : "Desativar volume",
    );
  }

  toggleButton.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      return;
    }

    audio.pause();
  });

  muteButton.addEventListener("click", () => {
    audio.muted = !audio.muted;
    syncVolume();
  });

  progress.addEventListener("input", () => {
    audio.currentTime = Number(progress.value);
    syncProgress();
  });

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    audio.muted = audio.volume === 0;
    syncVolume();
  });

  audio.addEventListener("play", () => {
    player.classList.add("is-playing");
    toggleButton.setAttribute("aria-label", "Pausar áudio");
  });

  audio.addEventListener("pause", () => {
    player.classList.remove("is-playing");
    toggleButton.setAttribute("aria-label", "Reproduzir áudio");
  });

  audio.addEventListener("loadedmetadata", syncProgress);
  audio.addEventListener("timeupdate", syncProgress);
  audio.addEventListener("volumechange", syncVolume);
  audio.addEventListener("ended", () => {
    player.classList.remove("is-playing");
    toggleButton.setAttribute("aria-label", "Reproduzir áudio");
  });

  audio.volume = Number(volume.value);
  syncProgress();
  syncVolume();
}

initSlider();
initExpandableCards();
initAudioPlayer();
initDiscursiveActivity();
initObjectiveActivity();
initFaq();

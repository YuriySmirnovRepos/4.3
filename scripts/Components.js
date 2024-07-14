import Utils from "./Utils.js";

class TextField {
  #suggestionsList = document.querySelector("ul");
  #txtField = document.querySelector("input");
  #dataManager;
  #selectedRepos;

  constructor(dataManager) {
    this.#dataManager = dataManager;
    this.#selectedRepos = new SelectedRepos(dataManager, this);
  }

  get text() {
    return this.#txtField.value;
  }

  set text(nwTxt) {
    this.#txtField.value = nwTxt;

    if (nwTxt.trim() === "") {
      this.clearSuggestionsList();
    }
  }

  listenInput(delay) {
    this.#txtField.addEventListener(
      "input",
      Utils.debounce(this.inputHandler, delay, this)
    );
  }

  inputHandler(evt) {
    const inputText = evt.target.value;
    const isEmptyInput = inputText.trim() === "";

    if (isEmptyInput) {
      this.clearSuggestionsList();
    }

    if (!this.#isValidKey(evt)) {
      return;
    }

    this.#dataManager
      .getReposData(inputText)
      .then((reposData) => this.#fillSuggestionsList(reposData))
      .catch(console.log);
  }

  #isValidKey(event) {
    const { value, ctrlKey, altKey, key } = event.target;
    const isEmptyInput = value.trim() === "";
    const isSpecialKey = [
      "Space",
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
    ].includes(key);

    return !isEmptyInput && !ctrlKey && !altKey && !isSpecialKey;
  }

  #fillSuggestionsList(suggestions) {
    this.clearSuggestionsList();

    suggestions.forEach(({ name }) => {
      const li = document.createElement("li");
      li.textContent = name;
      li.addEventListener("click", (evt) => {
        this.#selectedRepos.addRepoHandler(evt);
      });
      this.#suggestionsList.appendChild(li);
    });
  }

  clearSuggestionsList() {
    while (this.#suggestionsList.firstChild) {
      this.#suggestionsList.removeChild(this.#suggestionsList.firstChild);
    }
  }
}

class SelectedRepos {
  #selectedRepos = document.querySelector(".search-field__secondBlock");
  #dataManager;
  #selectedRepoTemplate = document.querySelector("#selectedRepoTemplate");
  #txtField;
  #addedRepos = new Set();

  constructor(dataManager, txtField) {
    this.#dataManager = dataManager;
    this.#txtField = txtField;
  }

  addRepoHandler(event = new MouseEvent()) {
    if (this.#selectedRepos.childElementCount >= 3) {
      this.#selectedRepos.firstElementChild.remove();
    }

    const repoName = event.target.textContent;
    const { owner: repoOwner, stargazers_count: starCount } =
      this.#dataManager.getReposData(repoName);

    if (this.#addedRepos.has(`${repoName + repoOwner}`)) {
      this.#txtField.text = "";
      return;
    }

    this.#addedRepos.add(`${repoName + repoOwner}`);

    const selectedRepoTemplate =
      this.#selectedRepoTemplate.content.cloneNode(true).firstElementChild;
    const selectedRepoTextEl = selectedRepoTemplate.querySelector(
      ".selectedRepo__text"
    );

    const createSpan = (text) => {
      const span = document.createElement("span");
      span.textContent = text;
      return span;
    };

    const nameSpan = createSpan(`Name: ${repoName}`);
    const ownerSpan = createSpan(`Owner: ${repoOwner}`);
    const starsSpan = createSpan(`Stars: ${starCount}`);

    selectedRepoTextEl.append(nameSpan, ownerSpan, starsSpan);

    this.#selectedRepos.appendChild(selectedRepoTemplate);

    const deleteIcon = selectedRepoTemplate.querySelector(
      ".selectedRepo__deleteIcon"
    );
    deleteIcon.addEventListener("click", this.#removeSelectedRepo);

    this.#txtField.text = "";
  }

  #removeSelectedRepo = (event) => {
    event.target.closest(".search-field__selectedRepo").remove();
    event.target.removeEventListener("click", this.#removeSelectedRepo);
  };
}

export default TextField;

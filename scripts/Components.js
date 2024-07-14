import Utils from "./Utils.js";

/**
 * Class representing a text field
 *
 * @class
 */
class TextField {
  /**
   * List of suggestions
   *
   * @type {HTMLElement}
   */
  #suggestionsList = document.querySelector(".search-field__suggestions");

  /**
   * Input field
   *
   * @type {HTMLElement}
   */
  #txtField = document.querySelector(".search-field__input");

  /**
   * Data manager
   *
   * @type {DataManager}
   */
  #dataManager;

  /**
   * Selected repos
   *
   * @type {SelectedRepos}
   */
  #selectedRepos;

  /**
   * Creates a new text field
   *
   * @param {DataManager} dataManager
   *
   * @constructor
   */
  constructor(dataManager) {
    this.#dataManager = dataManager;
    this.#selectedRepos = new SelectedRepos(dataManager, this);
  }

  /**
   * Gets the text of the input field
   *
   * @return {string} Text of the input field
   */
  get text() {
    return this.#txtField.value;
  }

  /**
   * Sets the text of the input field
   *
   * @param {string} nwTxt New text to set
   */
  set text(nwTxt) {
    this.#txtField.value = nwTxt;

    if (nwTxt.trim() === "") {
      this.clearSuggestionsList();
    }
  }

  /**
   * Listens for input in the text field and fills the suggestions list
   *
   * @param {number} delay Delay in milliseconds to wait before filling the list
   */
  listenInput(delay) {
    this.#txtField.addEventListener(
      "input",
      Utils.debounce(this.inputHandler, delay, this)
    );
  }

  /**
   * Handles the input event in the text field
   *
   * @param {Event} evt
   */
  inputHandler(evt) {
    const inputText = evt.target.value.trim();
    const isEmptyInput = inputText === "";

    if (isEmptyInput) {
      this.clearSuggestionsList();
      return;
    }

    if (!this.#isValidKey(evt)) {
      return;
    }

    this.#dataManager
      .getReposData(inputText)
      .then((reposData) => this.#fillSuggestionsList(reposData))
      .catch(console.log);
  }

  /**
   * Checks if the pressed key is valid for the input field
   *
   * @param {Event} evt
   *
   * @return {boolean} True if the key is valid, false otherwise
   */
  #isValidKey(evt) {
    const { value, ctrlKey, altKey, key } = evt.target;
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

  /**
   * Fills the suggestions list with the given data
   *
   * @param {Object[]} suggestions Data to fill the list with
   */
  #fillSuggestionsList(suggestions) {
    this.clearSuggestionsList();

    suggestions.forEach(({ name }) => {
      const li = document.createElement("li");
      li.textContent = name;
      li.classList.add("search-field__suggestion");
      li.addEventListener("click", (evt) => {
        this.#selectedRepos.addRepoHandler(evt);
      });
      this.#suggestionsList.appendChild(li);
    });
  }

  /**
   * Clears the suggestions list
   */
  clearSuggestionsList() {
    while (this.#suggestionsList.firstChild) {
      this.#suggestionsList.removeChild(this.#suggestionsList.firstChild);
    }
  }
}

/**
 * Represents a collection of selected repositories
 *
 * @class SelectedRepos
 * @param {DataManager} dataManager
 * @param {TextField} txtField
 */
class SelectedRepos {
  /**
   * The element that contains all the selected repositories
   *
   * @type {HTMLElement}
   */
  #selectedRepos;

  /**
   * The data manager that provides the repository data
   *
   * @type {DataManager}
   */
  #dataManager;

  /**
   * The template for a selected repository
   *
   * @type {HTMLTemplateElement}
   */
  #selectedRepoTemplate;

  /**
   * The text field that is used to input a repository name
   *
   * @type {TextField}
   */
  #txtField;

  /**
   * A set of all the selected repositories
   *
   * @type {Set<string>}
   */
  #addedRepos = new Set();

  /**
   * The constructor for the SelectedRepos class
   *
   * @param {DataManager} dataManager
   * @param {TextField} txtField
   */
  constructor(dataManager, txtField) {
    this.#dataManager = dataManager;
    this.#txtField = txtField;
    this.#selectedRepos = document.querySelector(".search-field__reposSelection");
    this.#selectedRepoTemplate = document.querySelector("#selectedRepoTemplate");
  }

  /**
   * Adds a repository to the list of selected repositories
   *
   * @param {MouseEvent} event
   */
  addRepoHandler(event = new MouseEvent()) {
    if (this.#selectedRepos.childElementCount >= 3) {
      this.#selectedRepos.firstElementChild.remove();
    }

    const repoName = event.target.textContent;
    const { owner, stars } = this.#dataManager.getRepoData(repoName);

    if (this.#addedRepos.has(`${repoName + owner}`)) {
      this.#txtField.text = "";
      return;
    }

    this.#addedRepos.add(`${repoName + owner}`);

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
    const ownerSpan = createSpan(`Owner: ${owner}`);
    const starsSpan = createSpan(`Stars: ${stars}`);

    selectedRepoTextEl.append(nameSpan, ownerSpan, starsSpan);

    this.#selectedRepos.appendChild(selectedRepoTemplate);

    const deleteIcon = selectedRepoTemplate.querySelector(
      ".selectedRepo__deleteIcon"
    );
    deleteIcon.addEventListener("click", this.#removeSelectedRepo);

    this.#txtField.text = "";
  }

  /**
   * Removes a selected repository from the list
   *
   * @param {MouseEvent} event
   */
  #removeSelectedRepo = (event) => {
    event.target.closest(".search-field__selectedRepo").remove();
    event.target.removeEventListener("click", this.#removeSelectedRepo);
  };
}


export default TextField;

import TextField from "./scripts/Components.js";
import DataManager from "./scripts/DataManager.js";

const BASE_URL = `https://api.github.com/search/repositories?per_page=5&q=`;
const DEBOUNCE_TIME = 500;

const dataManager = new DataManager(BASE_URL);
const txtField = new TextField(dataManager);
txtField.listenInput(DEBOUNCE_TIME);
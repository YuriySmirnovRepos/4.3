/**
 * Class representing a data manager for repositories
 *
 * @class DataManager
 */
class DataManager {
  /**
   * The cache for storing the results of the API calls
   *
   * @type {Map<string, Array<Object>>}
   */
  #cache = new Map();

  #currentQuery = '';

  /**
   * The base URL for the API
   *
   * @type {string}
   */
  #baseURL;

  /**
   * Creates an instance of DataManager.
   *
   * @param {string} baseURL - The base URL for the API
   */
  constructor(baseURL) {
    this.#baseURL = baseURL;
  }

  /**
   * Retrieves repositories data from the API
   *
   * @param {string} queryParam - The query parameter for the API
   * @return {Promise<Array<Object>>} - The repositories data
   */
  async getReposData(queryParam) {
    if (!queryParam) return [];

    this.#currentQuery = queryParam;

    if (this.#cache.has(queryParam)) return this.#cache.get(queryParam);

    const query = `${this.#baseURL}${encodeURIComponent(queryParam)}`;
    try {
      const response = await fetch(query);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const { items } = await response.json();
      let data = items?.map(this.#extractData) || []
      this.#cache.set(queryParam, data);
      return data;
    } catch (error) {
      console.error(error.message);
      return [];
    }
  }

  /**
   * Extracts data from a repository object
   *
   * @param {Object} repo - The repository object
   * @return {Object} - The extracted data
   */
  #extractData = ({
    id,
    name,
    owner: { login: owner },
    stargazers_count: stars,
  }) => ({
    id,
    name,
    owner,
    stars,
  });

  /**
   * Retrieves repository data based on the repository name
   *
   * @param {string} repoName - The name of the repository
   * @return {Object|undefined} - The repository data or undefined if not found
   */
  getRepoData(repoName) {
    return this.#cache.get(this.#currentQuery).find((repo) => repo.name === repoName);
  }
}

export default DataManager;

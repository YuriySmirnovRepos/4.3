class DataManager {
  #cache = new Map();
  #data = [];
  #baseURL;

  constructor(baseURL) {
    this.#baseURL = baseURL;
  }

  async getReposData(queryParam) {
    if (!queryParam) return;

    if (this.#cache.has(queryParam)) return this.#cache.get(queryParam);

    const query = `${this.#baseURL}${encodeURIComponent(queryParam)}`;
    try {
      const response = await fetch(query);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const { items } = await response.json();
      const data = items?.map(this.#extractData) || [];
      this.#cache.set(queryParam, data);
      return data;
    } catch (error) {
      console.error(error.message);
      return [];
    }
  }

  #extractData = ({ id, name, owner: { login: owner }, stargazers_count: stars }) => ({
    id,
    name,
    owner,
    stars,
  });

  getRepoData(repoName) {
    return this.#data.find((repo) => repo.name === repoName);
  }
}


export default DataManager;

const baseURL = `https://api.github.com/search/repositories?per_page=5&q=`;
const reposList = document.querySelector('ul');
const input = document.querySelector("input");
const selectedRepos = document.querySelector(".selected-repos");

const fillList = (evt = new KeyboardEvent()) => 
{
  if (evt.key == 'Backspace' && !evt.target.value)
  {
    removeListItems();
  }
  
  const query = `${baseURL}${encodeURIComponent(evt.target.value)}`
  if (evt.target.value.trim() != '' && 
    !evt.ctrlKey && 
    !evt.altKey && 
    evt.key != 'Space' &&
    evt.key != 'ArrowDown' &&
    evt.key != 'ArrowUp' &&
    evt.key != 'ArrowLeft' &&
    evt.key != 'ArrowRight') 
  {
    removeListItems();
    SendRequest(query)
    .then(
      (repos) => {
        // console.log(repos);
        addListItems(repos.items);
      })
      .catch(err => console.error(err));
  }
};

const debounce = (func, debounceTime) =>
{
  let timer;
  return function (...args)
  {
    clearTimeout(timer);
    timer = setTimeout(() =>
    {
      func.apply(this, args);
    }, debounceTime)
  }
}

function addListItems(reposArr)
{
    let nwListItem = null; 
    reposArr.forEach(repoData => 
    {
      nwListItem = document.createElement('li');
      nwListItem.textContent = repoData.name;
      nwListItem.addEventListener('click', addSelectedRepo)
      reposList.appendChild(nwListItem);
    });
}

function addSelectedRepo(evt = new MouseEvent())
{
  input.value = "";
  removeListItems();
  const selectedRepoTemplate = document.querySelector("#selectedRepoTemplate");
  let nwSelectedRepo = selectedRepoTemplate.content.firstElementChild.cloneNode(true);
  let brElmnt = document.createElement('br');
  let p = nwSelectedRepo.querySelector("p");

  p.append(`Name : ${evt.target.outerText}`, brElmnt, 
          "Owner :", brElmnt.cloneNode(), 
          "Stars :");
  selectedRepos.appendChild(nwSelectedRepo);
  let repoDelete = nwSelectedRepo.querySelector(".selected-repo_delete");
  repoDelete.addEventListener('click', removeSelectedRepo);
}

function removeListItems()
{
  while (reposList.firstChild) {reposList.removeChild(reposList.firstChild);}
}

function removeSelectedRepo(evt)
{
  console.log(evt.nodeName);
  let trgtName = evt.target.tagName.toLowerCase();
  trgtName == "div" ? 
  evt.target.parentElement.remove() : 
  evt.target.parentElement.parentElement.remove();
  
}

async function SendRequest(queryText){
  let response = await fetch(queryText);
  let json = null;
  if (response.ok)
  {
    json = await response.json();
  }
  else
  {
    alert("Ошибка HTTP: " + response.status);
  }
  return json;
}

input.addEventListener('keydown', 
        debounce((event) => fillList(event), 800));
const baseURL = `https://api.github.com/search/repositories?per_page=5&q=`;
const selectionList = document.querySelector('ul');
const input = document.querySelector("input");
const selectedRepos = document.querySelector(".selected-repos");

const fillSelectionList = (evt = new KeyboardEvent()) => 
{
  if (evt.key == 'Backspace' && !evt.target.value)
  {
    clearSelectionList();
  }
  
  const query = `${baseURL}${encodeURIComponent(evt.target.value)}`
  if (isCorrectKey(evt)) 
  {
    clearSelectionList();
    SendRequest(query)
    .then(
      (repos) => {
        console.log(repos);
        // processData(repos.items);
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

function isCorrectKey(evt)
{
  return evt.target.value.trim() != '' && 
    !evt.ctrlKey && 
    !evt.altKey && 
    evt.key != 'Space' &&
    evt.key != 'ArrowDown' &&
    evt.key != 'ArrowUp' &&
    evt.key != 'ArrowLeft' &&
    evt.key != 'ArrowRight'
}


function addListItems(reposArr)
{
    let nwListItem = null; 
    reposArr.forEach(repoData => 
    {
      nwListItem = document.createElement('li');
      nwListItem.textContent = repoData.name;
      nwListItem.addEventListener('click', addSelectedRepo)
      selectionList.appendChild(nwListItem);
    });
}

function addSelectedRepo(evt = new MouseEvent())
{
  input.value = "";
  clearSelectionList();

  const selectedRepoTemplate = document.querySelector("#selectedRepoTemplate");
  let nwSelectedRepo = selectedRepoTemplate.content.firstElementChild.cloneNode(true);
  let brElmnt = document.createElement('br');
  let p = nwSelectedRepo.querySelector("p");

  p.append(`Name : ${evt.target.outerText}`, brElmnt, 
          "Owner :", brElmnt.cloneNode(), 
          "Stars :");
  selectedRepos.appendChild(nwSelectedRepo);
  let repoDelete = nwSelectedRepo.querySelector("svg");
  repoDelete.addEventListener('click', removeSelectedRepo);
}

function clearSelectionList()
{
  while (selectionList.firstChild) 
  {
    selectionList.removeChild(selectionList.firstChild);
  }
}

function removeSelectedRepo(evt = new MouseEvent())
{
  evt.target.closest(".selected-repos_selected-repo").remove(); 
  evt.target.removeEventListener('click', removeSelectedRepo);
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
        debounce((event) => fillSelectionList(event), 800));
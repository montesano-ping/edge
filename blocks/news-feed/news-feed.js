/*
 * News Feed Block
 * Create a news feed with a provided json source
 * https://main--webdev-edge-docs--pingidentity-web.aem.page/tools/sidekick/library.html?plugin=blocks&path=/tools/sidekick/blocks/news-feed&index=0
 */

/* eslint-disable no-console */

const DEFAULT_ITEMS_PER_PAGE = 10;
const CONSOLE_LOGGING_ON = window.pdsEdge?.environment === 'local' || window.pdsEdge?.environment === 'stage';

let feedItems = [];
let numPages = 0;
let itemsPerPage;
let selectedPage;
let globalItemListContainer;

/*
  fetchSrc()
  Takes source from decorate() and makes a GET request to it. Response body
  should be a JSON file generated from a Google Sheet.
  Returns json file
*/
function fetchSrc(source) {
  return fetch(source)
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error fetching news feed:', error);
      return null;
    });
}

/*
  generatePage()
  Used for pagination. Creates page to display items in the correct index range
  based on selected page.
*/
function generatePage(items) {
  globalItemListContainer.style.opacity = '.5';
  globalItemListContainer.style.userSelect = 'none';

  setTimeout(() => {
    globalItemListContainer.innerHTML = '';

    items.forEach((item) => {
      const itemLi = document.createElement('li');
      itemLi.classList.add('item');
      const itemWrapper = document.createElement('div');
      itemWrapper.classList.add('item-wrapper');
      const contentWrapper = document.createElement('div');
      contentWrapper.classList.add('content-wrapper');

      const itemDate = document.createElement('div');
      itemDate.classList.add('date');
      itemDate.innerText = new Date(item.date).toLocaleDateString('en-US');
      const itemTitle = document.createElement('a');
      itemTitle.classList.add('item-title');
      itemTitle.innerText = item.title;
      itemTitle.href = item.redirectTarget;
      itemTitle.target = '_blank';

      contentWrapper.appendChild(itemDate);
      contentWrapper.appendChild(itemTitle);

      const readMoreLink = document.createElement('a');
      readMoreLink.classList.add('read-more-link');
      readMoreLink.innerText = 'Read More';
      readMoreLink.href = item.redirectTarget;
      readMoreLink.target = '_blank';

      itemWrapper.appendChild(contentWrapper);
      itemWrapper.appendChild(readMoreLink);

      itemLi.appendChild(itemWrapper);

      globalItemListContainer.appendChild(itemLi);
    });

    globalItemListContainer.style.opacity = 1;
    globalItemListContainer.style.userSelect = 'inherit';
  }, 200);
}

/*
  updateSelectedPage()
  Handles updating of global selectedPage variable, generates new page as requested,
  and updates appearance of pagination navbar based on selection.
*/
function updateSelectedPage(newValue) {
  // avoid out of bounds errors
  if (newValue < 1 || newValue > numPages) return;

  selectedPage = newValue;

  // disable prev/next buttons as necessary
  document.querySelector('.prev-page-button').disabled = newValue === 1;
  document.querySelector('.next-page-button').disabled = newValue === numPages - 1;

  // generate new page
  const newStartIndex = (selectedPage - 1) * itemsPerPage;
  let newEndIndex;
  if (newValue === numPages) {
    // If on the last page, ensure to capture all remaining items.
    newEndIndex = feedItems.length;
  } else {
    newEndIndex = selectedPage * itemsPerPage;
  }

  // Generate the page content with the calculated slice of items.
  generatePage(feedItems.slice(newStartIndex, newEndIndex));

  // update incidator on pagination navbar
  document.querySelectorAll('.pagination-nav button').forEach((button) => {
    button.style.display = 'initial';
    button.classList.remove('active-page');
  });
  document.querySelector(`.pagination-nav button[key='${newValue}']`).classList.add('active-page');

  // update appearance of paginator
  if (selectedPage < 7) {
    document.querySelector('.pagination-nav .start-elipses').style.display = 'none';
    document.querySelector('.pagination-nav .end-elipses').style.display = 'initial';

    document.querySelectorAll('.pagination-nav button').forEach((button) => {
      button.style.display = button.getAttribute('key') > 7 ? 'none' : 'initial';
    });
  } else if (selectedPage > numPages - 7) {
    document.querySelector('.pagination-nav .start-elipses').style.display = 'initial';
    document.querySelector('.pagination-nav .end-elipses').style.display = 'none';

    document.querySelectorAll('.pagination-nav button').forEach((button) => {
      button.style.display = button.getAttribute('key') < numPages - 7 ? 'none' : 'initial';
    });
  } else {
    document.querySelector('.pagination-nav .start-elipses').style.display = 'initial';
    document.querySelector('.pagination-nav .end-elipses').style.display = 'initial';

    document.querySelectorAll('.pagination-nav button').forEach((button) => {
      if (button.getAttribute('key') !== 1 && button.getAttribute('key') !== numPages) {
        button.style.display = 'none';
        document.querySelector(`.pagination-nav button[key='${newValue}']`).style.display = 'initial';
        for (let buttonRadius = 1; buttonRadius < 4; buttonRadius += 1) {
          document.querySelector(`.pagination-nav button[key='${newValue - buttonRadius}']`).style.display = 'initial';
          document.querySelector(`.pagination-nav button[key='${newValue + buttonRadius}']`).style.display = 'initial';
        }
      }
    });
  }

  // protect buttons that shouldn't be hidden
  document.querySelector('.pagination-nav .prev-page-button').style.display = 'initial';
  document.querySelector('.pagination-nav .next-page-button').style.display = 'initial';
  document.querySelector('.pagination-nav button[key="1"]').style.display = 'initial';
  document.querySelector(`.pagination-nav button[key='${numPages}'`).style.display = 'initial';

  // update page number in search params
  const params = new URLSearchParams(window.location.search);
  params.set('p', selectedPage);
  window.history.pushState(null, '', `?${params.toString()}`);
}

/*
  initializePaginationNav()
  Handles creation of pagination nav including prev and next buttons, elipses, first
  and last page buttons, and all in-between buttons.
  Elipses and in-between buttons display are conditional based on the selection - see
  logic in updateSelectedPage for details.
*/
function initializePaginationNav(navContainer) {
  navContainer.innerHTML = '';

  const paginationNav = document.createElement('nav');
  paginationNav.classList.add('pagination-nav');

  const prevButton = document.createElement('button');
  prevButton.classList.add('prev-page-button');
  prevButton.innerText = '«';
  prevButton.onclick = () => {
    updateSelectedPage(selectedPage - 1);
  };

  const nextButton = document.createElement('button');
  nextButton.classList.add('next-page-button');
  nextButton.innerText = '»';
  nextButton.onclick = () => {
    updateSelectedPage(selectedPage + 1);
  };

  const firstPageButton = document.createElement('button');
  firstPageButton.innerText = '1';
  firstPageButton.setAttribute('key', 1);
  firstPageButton.onclick = () => {
    updateSelectedPage(1);
  };

  const lastPageButton = document.createElement('button');
  lastPageButton.innerText = numPages;
  lastPageButton.setAttribute('key', numPages);
  lastPageButton.onclick = () => {
    updateSelectedPage(numPages);
  };

  const startElipses = document.createElement('span');
  startElipses.classList.add('start-elipses');
  startElipses.innerText = '...';

  const endElipses = document.createElement('span');
  endElipses.classList.add('end-elipses');
  endElipses.innerText = '...';

  paginationNav.appendChild(prevButton);
  paginationNav.appendChild(firstPageButton);
  paginationNav.appendChild(startElipses);

  // insert all numbers between 1 and n
  for (let pageNumber = 2; pageNumber < numPages; pageNumber += 1) {
    const pageNumberButton = document.createElement('button');
    pageNumberButton.innerText = pageNumber;
    pageNumberButton.setAttribute('key', pageNumber);
    pageNumberButton.onclick = () => {
      updateSelectedPage(pageNumber);
    };
    paginationNav.appendChild(pageNumberButton);
  }

  paginationNav.appendChild(endElipses);
  paginationNav.appendChild(lastPageButton);
  paginationNav.appendChild(nextButton);

  navContainer.appendChild(paginationNav);
}

function getSelectedPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('p')) {
    const page = parseInt(params.get('p'), 10);

    if (page <= numPages) {
      return page;
    }
  }
  return 1;
}

export default function decorate(block) {
  const newsfeedSrc = block.children[0]?.children[1]?.querySelector('p')?.innerText;
  itemsPerPage = block.children[1]?.children[1]?.querySelector('p')?.innerText || DEFAULT_ITEMS_PER_PAGE;

  if (CONSOLE_LOGGING_ON) console.log('News feed source is: ', newsfeedSrc);

  // first row - 'Most Recent' and feed items
  const mainRow = document.createElement('div');
  mainRow.classList.add('main-row');

  block.innerHTML = '';

  const mostRecentHeading = document.createElement('div');
  mostRecentHeading.classList.add('most-recent-heading');
  mostRecentHeading.innerText = 'Most Recent';
  mainRow.appendChild(mostRecentHeading);

  const newsfeedList = document.createElement('div');
  newsfeedList.classList.add('newsfeed-list');
  const itemListContainer = document.createElement('ul');
  itemListContainer.classList.add('item-list');
  globalItemListContainer = itemListContainer;

  fetchSrc(newsfeedSrc).then((newsFeed) => {
    if (newsFeed !== null && newsFeed.data) {
      feedItems = newsFeed.data.reverse();

      // convert serialized dates to readable format
      const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
      const BASE_DATE = new Date(1899, 11, 30).getTime();
      feedItems.forEach((item) => {
        const dateInMillis = BASE_DATE + (item.date * MILLISECONDS_IN_A_DAY);
        const date = new Date(dateInMillis);
        item.date = date.toLocaleDateString('en-US');
      });

      numPages = Math.ceil(feedItems.length / itemsPerPage);

      if (CONSOLE_LOGGING_ON) console.log('Number of pages: ', numPages);

      if (CONSOLE_LOGGING_ON) console.log('Feed Items: ', feedItems);

      newsfeedList.appendChild(itemListContainer);
      mainRow.append(newsfeedList);

      block.appendChild(mainRow);

      const navWrapper = document.createElement('div');
      initializePaginationNav(navWrapper);
      block.appendChild(navWrapper);

      const startPage = getSelectedPageFromURL();
      updateSelectedPage(startPage);
    } else {
      const errorMsg = document.createElement('p');
      errorMsg.classList.add('error-msg');
      errorMsg.textContent = 'There are no results. Please try again.';
      if (CONSOLE_LOGGING_ON) console.error(errorMsg);
      block.appendChild(errorMsg);
      if (CONSOLE_LOGGING_ON) console.error('There are no news feed items. Check response.');
    }

    return block;
  });
}

window.addEventListener('popstate', () => {
  if (getSelectedPageFromURL() !== selectedPage) {
    updateSelectedPage(getSelectedPageFromURL());
  }
});

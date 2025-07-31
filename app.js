window.addEventListener('DOMContentLoaded', function () {
  console.log("Page loaded. Tabletop is:", typeof Tabletop); // debug

  if (typeof Tabletop === 'undefined') {
    console.error('❌ Tabletop failed to load!');
    return;
  }

  const publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1aNyI_tF-7dopONbWz6RmhT8mOrxw5YbJhyQ93onhzcs/edit?usp=sharing';

  Tabletop.init({
    key: publicSpreadsheetUrl,
    callback: showItems,
    simpleSheet: true
  });

  document.getElementById('toggleFilters').addEventListener('click', () => {
    document.getElementById('filterPanel').classList.toggle('show');
  });
});

function showItems(data) {
  const container = document.getElementById('itemsContainer');
  container.innerHTML = '';

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    if (item['Upload Image']) {
      const img = document.createElement('img');
      img.src = item['Upload Image'];
      card.appendChild(img);
    }

    const title = document.createElement('h3');
    title.textContent = item['Item Name'];
    card.appendChild(title);

    const category = document.createElement('p');
    category.textContent = `Category: ${item['Category']}`;
    card.appendChild(category);

    const location = document.createElement('p');
    location.textContent = `Location: ${item['Location Found']}`;
    card.appendChild(location);

    const date = document.createElement('p');
    date.textContent = `Date Found: ${new Date(item['Date Found']).toLocaleDateString()}`;
    card.appendChild(date);

    const desc = document.createElement('p');
    desc.textContent = item['Description'];
    card.appendChild(desc);

    container.appendChild(card);
  });
}

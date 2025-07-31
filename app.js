let allItems = [];

window.addEventListener('DOMContentLoaded', function () {
  console.log("Page loaded. Tabletop is:", typeof Tabletop); // debug

  if (typeof Tabletop === 'undefined') {
    console.error('❌ Tabletop failed to load!');
    return;
  }

  const publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1aNyI_tF-7dopONbWz6RmhT8mOrxw5YbJhyQ93onhzcs/edit?usp=sharing';

  Tabletop.init({
    key: publicSpreadsheetUrl,
    callback: initializeData,
    simpleSheet: true
  });

  document.getElementById('toggleFilters').addEventListener('click', () => {
    document.getElementById('filterPanel').classList.toggle('show');
  });

  // Add filter event listeners
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('include-filter') || 
        e.target.classList.contains('exclude-filter') || 
        e.target.id === 'dateRange') {
      applyFilters();
    }
  });
});

function initializeData(data) {
  allItems = data;
  showItems(data);
}

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

function applyFilters() {
  const includeFilters = Array.from(document.querySelectorAll('.include-filter:checked')).map(cb => cb.value);
  const excludeFilters = Array.from(document.querySelectorAll('.exclude-filter:checked')).map(cb => cb.value);
  const dateRange = document.getElementById('dateRange').value;

  let filteredItems = allItems.filter(item => {
    const category = item['Category']?.toLowerCase();
    const location = item['Location Found']?.toLowerCase();
    const dateFound = new Date(item['Date Found']);
    const now = new Date();

    // Include filters (if any selected, item must match at least one)
    if (includeFilters.length > 0) {
      const matches = includeFilters.some(filter => 
        category?.includes(filter) || location?.includes(filter)
      );
      if (!matches) return false;
    }

    // Exclude filters (if any selected, item must not match any)
    if (excludeFilters.length > 0) {
      const matches = excludeFilters.some(filter => 
        category?.includes(filter) || location?.includes(filter)
      );
      if (matches) return false;
    }

    // Date range filter
    if (dateRange !== 'all') {
      const dayMs = 24 * 60 * 60 * 1000;
      let cutoff;
      
      switch (dateRange) {
        case 'day': cutoff = new Date(now - dayMs); break;
        case 'week': cutoff = new Date(now - 7 * dayMs); break;
        case 'month': cutoff = new Date(now - 30 * dayMs); break;
        case 'semester': cutoff = new Date(now - 120 * dayMs); break;
      }
      
      if (dateFound < cutoff) return false;
    }

    return true;
  });

  showItems(filteredItems);
}

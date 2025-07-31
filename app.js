let allItems = [];

window.addEventListener('DOMContentLoaded', function () {
  const publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2eieTS57RhVUkWUu-2JwixQn2sAWyEYdcgb4JJn4K0qs6vDdrdOS-593pf0Jxm1_MSqv8w_6xlJj5/pubhtml';

  Tabletop.init({
    key: publicSpreadsheetUrl,
    callback: initializeData,
    simpleSheet: true
  });

  document.getElementById('toggleFilters').addEventListener('click', () => {
    document.getElementById('filterPanel').classList.toggle('show');
  });

  document.addEventListener('change', (e) => {
    if (
      e.target.classList.contains('include-filter') ||
      e.target.classList.contains('exclude-filter') ||
      e.target.id === 'dateRange'
    ) {
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

  if (!data || data.length === 0) {
    container.innerHTML = '<p>No items to display.</p>';
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    if (item['Upload Image']) {
      const img = document.createElement('img');
      img.src = item['Upload Image'];
      card.appendChild(img);
    }

    const title = document.createElement('h3');
    title.textContent = item['Item Name'] || 'Unnamed';
    card.appendChild(title);

    const category = document.createElement('p');
    category.textContent = `Category: ${item['Category'] || 'N/A'}`;
    card.appendChild(category);

    const location = document.createElement('p');
    location.textContent = `Location: ${item['Location Found'] || 'N/A'}`;
    card.appendChild(location);

    const date = document.createElement('p');
    const rawDate = item['Timestamp']; // Use form timestamp
    date.textContent = `Date Found: ${new Date(rawDate).toLocaleDateString()}`;
    card.appendChild(date);

    const desc = document.createElement('p');
    desc.textContent = item['Description'] || '';
    card.appendChild(desc);

    container.appendChild(card);
  });
}

function applyFilters() {
  const includeFilters = Array.from(document.querySelectorAll('.include-filter:checked')).map(cb => cb.value.toLowerCase());
  const excludeFilters = Array.from(document.querySelectorAll('.exclude-filter:checked')).map(cb => cb.value.toLowerCase());
  const dateRange = document.getElementById('dateRange').value;

  const filteredItems = allItems.filter(item => {
    const category = item['Category']?.toLowerCase();
    const location = item['Location Found']?.toLowerCase();
    const dateFound = new Date(item['Timestamp']);
    const now = new Date();

    // Include Filters
    if (includeFilters.length > 0) {
      const matches = includeFilters.some(filter =>
        category?.includes(filter) || location?.includes(filter)
      );
      if (!matches) return false;
    }

    // Exclude Filters
    if (excludeFilters.length > 0) {
      const matches = excludeFilters.some(filter =>
        category?.includes(filter) || location?.includes(filter)
      );
      if (matches) return false;
    }

    // Date Range Filter
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

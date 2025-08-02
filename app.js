let allItems = [];

window.addEventListener('DOMContentLoaded', function () {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/1aNyI_tF-7dopONbWz6RmhT8mOrxw5YbJhyQ93onhzcs/export?format=csv';
  
  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const data = parseCSV(csvText);
      initializeData(data);
    })
    .catch(error => {
      console.error('Error loading data:', error);
      document.getElementById('itemsContainer').innerHTML = '<p>Unable to load items. Please try again later.</p>';
    });

  document.getElementById('toggleFilters').addEventListener('click', () => {
    const panel = document.getElementById('filterPanel');
    const icon = document.getElementById('filterToggleIcon');
    panel.classList.toggle('show');
    icon.textContent = panel.classList.contains('show') ? '▲' : '▼';
  });

  document.addEventListener('change', (e) => {
    if (
      e.target.name === 'includeFilter' ||
      e.target.classList.contains('exclude-filter') ||
      e.target.name === 'dateRange'
    ) {
      applyFilters();
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-section-toggle') || e.target.parentElement.classList.contains('filter-section-toggle')) {
      const button = e.target.classList.contains('filter-section-toggle') ? e.target : e.target.parentElement;
      const targetId = button.getAttribute('data-target');
      const panel = document.getElementById(targetId);
      const icon = button.querySelector('.toggle-icon');
      
      panel.classList.toggle('show');
      icon.textContent = panel.classList.contains('show') ? '▲' : '▼';
    }
  });
});

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      if (values.length > 5) {
        const item = {
          'Timestamp': values[0] || '',
          'Item Name': values[1] || '',
          'Category': values[2] || '',
          'Location Found': values[3] || '',
          'Description': values[4] || '',
          'Upload Image': values[5] || ''
        };
        data.push(item);
      }
    }
  }
  return data;
}

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
      img.alt = item['Item Name'] || 'Lost item';
      card.appendChild(img);
    }

    const title = document.createElement('h3');
    title.textContent = item['Item Name'] || 'Unnamed Item';
    card.appendChild(title);

    const category = document.createElement('p');
    category.textContent = `Category: ${item['Category'] || 'N/A'}`;
    card.appendChild(category);

    const location = document.createElement('p');
    location.textContent = `Location: ${item['Location Found'] || 'N/A'}`;
    card.appendChild(location);

    const date = document.createElement('p');
    const timestamp = item['Timestamp'] || item['Date Found'];
    if (timestamp) {
      date.textContent = `Date: ${new Date(timestamp).toLocaleDateString()}`;
    } else {
      date.textContent = 'Date: N/A';
    }
    card.appendChild(date);

    if (item['Description']) {
      const desc = document.createElement('p');
      desc.textContent = item['Description'];
      card.appendChild(desc);
    }

    container.appendChild(card);
  });
}

function applyFilters() {
  if (allItems.length === 0) return;
  
  const includeFilter = document.querySelector('input[name="includeFilter"]:checked')?.value || '';
  const excludeFilters = Array.from(document.querySelectorAll('.exclude-filter:checked')).map(cb => cb.value.toLowerCase());
  const dateRange = document.querySelector('input[name="dateRange"]:checked')?.value || 'all';

  const filteredItems = allItems.filter(item => {
    const category = item['Category']?.toLowerCase() || '';
    const location = item['Location Found']?.toLowerCase() || '';
    const timestamp = item['Timestamp'] || item['Date Found'];
    const dateFound = timestamp ? new Date(timestamp) : new Date();
    const now = new Date();

    if (includeFilter && includeFilter !== '') {
      const matches = category.includes(includeFilter.toLowerCase()) || location.includes(includeFilter.toLowerCase());
      if (!matches) return false;
    }

    if (excludeFilters.length > 0) {
      const matches = excludeFilters.some(filter =>
        category.includes(filter) || location.includes(filter)
      );
      if (matches) return false;
    }

    if (dateRange !== 'all' && timestamp) {
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
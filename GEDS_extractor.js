const csvFile = document.getElementById('csvFile');
const searchInput = document.getElementById('searchInput');
const filterInput = document.getElementById('filterInput');
const filterButton = document.getElementById('filterButton');
const downloadLink = document.getElementById('downloadLink');

csvFile.addEventListener('change', () => {
  const files = csvFile.files;
  if (files.length === 0) {
    alert('Please select a CSV file first.');
    return;
  }

  const file = files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const data = reader.result;
    const rows = data.split('\n');
    const headers = rows[0].split(',');
    const titleIndex = headers.indexOf('Title (EN)');

    if (titleIndex === -1) {
      alert('The CSV file does not contain a "Title (EN)" column.');
      return;
    }

    // Clear existing options
    filterInput.innerHTML = '';

    // Get unique values from "Title (EN)" column
    let uniqueTitles = new Set();
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].split(',');
      if (cells.length > titleIndex) {
        const title = cells[titleIndex] ? cells[titleIndex].trim().replaceAll('"',"") : '';
        uniqueTitles.add(title);
      }
    }
    uniqueTitles=Array.from(uniqueTitles).sort()

    // Add options to the select element
    const options = Array.from(uniqueTitles).map(title => {
      const option = document.createElement('option');
      option.value = title;
      option.text = title;
      return option;
    });
    options.forEach(option => filterInput.add(option));

    // Filter options based on search input
    searchInput.addEventListener('input', () => {
      const searchValue = searchInput.value.trim().toLowerCase();
      options.forEach(option => {
        const optionText = option.text.toLowerCase();
        if (optionText.includes(searchValue)) {
          option.style.display = 'block';
        } else {
          option.style.display = 'none';
        }
      });
    });
  };

  reader.readAsText(file);
});

filterButton.addEventListener('click', () => {
  const files = csvFile.files;
  if (files.length === 0) {
    alert('Please select a CSV file first.');
    return;
  }

  const file = files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const data = reader.result;
    const rows = data.split('\n');
    const headers = rows[0].split(',');
    const titleIndex = headers.indexOf('Title (EN)');

    if (titleIndex === -1) {
      alert('The CSV file does not contain a "Title (EN)" column.');
      return;
    }

    const filterValues = Array.from(filterInput.selectedOptions).map(option => option.value.toLowerCase().trim());
    console.dir(filterInput)

    // filter the csv rows according to the selected options
    const filteredRows = rows.filter((row, index) => {
      if (index === 0) return true; // Keep header row
      const cells = row.split('",');
      const title = cells[titleIndex] ? cells[titleIndex].trim().toLowerCase().replaceAll('"',"") : '';

      // filter if the title.... includes ANY ONE of the selected options
      return filterValues.some(filterValue => title === filterValue);
    });


    const filteredData = filteredRows.join('\n');
    const blob = new Blob([filteredData], { type: 'text/csv;charset=utf-8' });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.style.display = 'inline';
  };

  reader.readAsText(file);
});
document.addEventListener("DOMContentLoaded", function () {

  const csvFile = document.getElementById('csvFile');
  const searchInput = document.getElementById('searchInput');
  const excludeInput = document.getElementById('excludeInput');
  const filterInput = document.getElementById('filterInput');
  const downloadButton = document.getElementById('downloadButton');
  const downloadLink = document.getElementById('downloadLink');
  let options = [];

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
          const title = cells[titleIndex] ? cells[titleIndex].trim().replaceAll('"', "") : '';
          uniqueTitles.add(title);
        }
      }
      uniqueTitles = Array.from(uniqueTitles).sort()

      // Add options to the select element
      options = Array.from(uniqueTitles).map(title => {
        const option = document.createElement('option');
        option.value = title;
        option.text = title;
        option.dataset.include = 'true'
        return option;
      });
      options.forEach(option => filterInput.add(option));


    };


    reader.readAsText(file);
  });
  // Filter options based on search input
  searchInput.addEventListener('input', () => {
    // if we already populated the options after loading the file, use those, else use the ones on the page
    const opts = options.length > 0 ? options : Array.from(filterInput.options);
    const searchTerms = searchInput.value.split(',').map(term => term.trim().toLowerCase()).filter(term => term !== '');

    opts.forEach(option => {
      const optionText = option.text.toLowerCase();
      const shouldHide = !searchTerms.some(term => optionText.includes(term));
      if (shouldHide) {
        option.dataset.include = 'false';
      } else {
        option.dataset.include = 'true';
      }
    });
    handleShowHide(opts)
  });

  // Exclude options based on exclude input
  excludeInput.addEventListener('input', () => {
    // if we already populated the options after loading the file, use those, else use the ones on the page
    const opts = options.length > 0 ? options : Array.from(filterInput.options);
    const filteredOptions = opts.filter((op) => op.dataset.include === "true");

    const searchTerms = excludeInput.value.split(',').map(term => term.trim().toLowerCase()).filter(term => term !== '');

    filteredOptions.forEach(option => {
      const optionText = option.text.toLowerCase();
      const shouldHide = searchTerms.some(term => optionText.includes(term));
      if (searchTerms.length > 0 && shouldHide) {
        option.dataset.exclude = 'true';
      } else {
        option.dataset.exclude = 'false';
      }
    });
    handleShowHide(opts)
  });

  function handleShowHide(options) {
    // handle the show/hide of the elements
    options.forEach(option => {
      const shouldHide = option.dataset.exclude === 'true' || option.dataset.include === 'false';
      if (shouldHide) {
        option.style.display = 'none';
      } else {
        option.style.display = 'block';
      }
    });
  }

  downloadButton.addEventListener('click', () => {
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
        const title = cells[titleIndex] ? cells[titleIndex].trim().toLowerCase().replaceAll('"', "") : '';

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

})

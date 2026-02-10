/**
 * Adds a custom menu to the active spreadsheet.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Inventory Manager')
      .addItem('New Entry Form', 'showEntryForm')
      .addItem('Edit Entry Form', 'showEditEntryForm')
      .addToUi();
}

/**
 * Displays the Entry Form directly in a modal dialog.
 */
function showEntryForm() {
  const template = HtmlService.createTemplateFromFile('entry-form');
  template.scriptUrl = ScriptApp.getService().getUrl();
  
  const html = template.evaluate()
    .setWidth(1200)
    .setHeight(800)
    .setTitle('Inventory Entry System'); // Set title on the output, not the template
    
  SpreadsheetApp.getUi().showModalDialog(html, 'Inventory Entry System');
}

/**
 * Displays the Edit Entry Form with pre-filled data from selected row's Challan group.
 */
function showEditEntryForm() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const activeCell = sheet.getActiveCell();
  const rowIndex = activeCell.getRow();
  
  // Validate that we're in the Entry sheet
  if (sheet.getName() !== 'Entry' || rowIndex < 2) {
    SpreadsheetApp.getUi().alert('Please select a cell in the Entry sheet (not header row)');
    return;
  }
  
  const template = HtmlService.createTemplateFromFile('edit-entry-form');
  template.scriptUrl = ScriptApp.getService().getUrl();
  template.rowIndex = rowIndex; // Pass row index to template
  
  const html = template.evaluate()
    .setWidth(1200)
    .setHeight(800)
    .setTitle('Edit Inventory Entry');
    
  SpreadsheetApp.getUi().showModalDialog(html, 'Edit Inventory Entry');
}

/**
 * Legacy support for open menu instances.
 */
function showUrlDialog() {
  showEntryForm();
}

/**
 * Serves the HTML entry form or settings page.
 */
function doGet(e) {
  const page = e.parameter.page || 'entry';
  let template;
  
  if (page === 'settings') {
    template = HtmlService.createTemplateFromFile('settings');
  } else {
    template = HtmlService.createTemplateFromFile('entry-form');
  }
  
  // Pass the script URL to the template for navigation links
  template.scriptUrl = ScriptApp.getService().getUrl();

  return template.evaluate()
    .setTitle('Inventory Entry System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper to get the script URL for the client side if needed
 */
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * Fetches dropdown options from the "Settings" sheet.
 */
/**
 * Fetches dropdown options from the "Settings" sheet.
 */
function getDropdownData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName("Settings");
  
  if (!settingsSheet) {
    return { locations: [], items: [], stores: [], customers: [], itemList: [] };
  }

  const lastRow = Math.max(settingsSheet.getLastRow(), 2);
  
  // Column A: Item List
  const itemData = settingsSheet.getRange("A2:A" + lastRow).getValues().flat().filter(String);
  
  // Column B: Store List
  const storeData = settingsSheet.getRange("B2:B" + lastRow).getValues().flat().filter(String);
  
  // Column C: Customer List
  const customerData = settingsSheet.getRange("C2:C" + lastRow).getValues().flat().filter(String);

  // Legacy support: 'locations' combines stores and customers
  const locations = [...new Set([...storeData, ...customerData])];

  return {
    locations: locations.sort(),
    items: itemData.sort(),
    // Specific lists for the settings manager
    itemList: itemData.sort(),
    stores: storeData.sort(),
    customers: customerData.sort(),
    stock: getInventoryStock()
  };
}

/**
 * Calculates current stock for all items based on Entry sheet history.
 */
function getInventoryStock() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Entry");
  const stock = {};

  if (!sheet) return stock;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return stock;

  // Optimizing: Read Type (Col 2), ItemName (Col 6), Qty (Col 7)
  // Get all data in one go for speed
  const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();

  data.forEach(row => {
    const type = row[1]; // Column 2
    const item = row[5]; // Column 6
    const qty = parseFloat(row[6]) || 0; // Column 7

    if (!item) return;

    if (!stock[item]) stock[item] = 0;

    if (type === 'Received') {
      stock[item] += qty;
    } else if (type === 'Send') {
      stock[item] -= qty;
    }
  });

  return stock;
}

/**
 * Manages settings (Add/Edit/Delete) for Item, Store, and Customer lists.
 */
function manageSetting(action, listType, value, newValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Settings");
  
  if (!sheet) {
    sheet = ss.insertSheet("Settings");
    sheet.appendRow(["Item List", "Store List", "Customer List"]);
    sheet.getRange("A1:C1").setFontWeight("bold");
  }

  // Column Mapping
  let col = 1;
  if (listType === 'store') col = 2;
  if (listType === 'customer') col = 3;

  const lastRow = Math.max(sheet.getLastRow(), 2);
  const range = sheet.getRange(2, col, lastRow, 1); // Search from row 2

  if (action === 'add') {
    // Simple append to bottom for efficiency, or find first empty slot
    // For simplicity with GAS, we'll append to the first empty cell in the column
    // But textFinder is faster for checking existence. 
    // Let's just append to the next empty cell methodically.
    
    // Check if exists
    const finder = range.createTextFinder(value).matchEntireCell(true);
    if (!finder.findNext()) {
      // Find payload: load all values and find first empty index mapping to row
      const values = sheet.getRange(2, col, lastRow, 1).getValues().flat();
      let insertIndex = values.findIndex(v => v === "");
      let insertRow = (insertIndex === -1) ? (sheet.getLastRow() + 1) : (insertIndex + 2);
      
      // If the column is completely full up to lastRow, append to lastRow+1
      // If the sheet's lastRow is determined by other columns, we might be inserting in the middle
      // safe bet:
      if (insertIndex === -1 && values.length > 0) insertRow = values.length + 2;
      
      sheet.getRange(insertRow, col).setValue(value);
    }
  } 
  else if (action === 'delete') {
    const finder = range.createTextFinder(value).matchEntireCell(true);
    const cell = finder.findNext();
    if (cell) cell.clearContent();
  } 
  else if (action === 'edit') {
    const finder = range.createTextFinder(value).matchEntireCell(true);
    const cell = finder.findNext();
    if (cell) cell.setValue(newValue);
    
    // Cascade update to Entry sheet
    const entrySheet = ss.getSheetByName('Entry');
    if (entrySheet && entrySheet.getLastRow() > 1) {
      // Determine which column to update in Entry sheet
      let entryCol;
      if (listType === 'item') {
        entryCol = 6; // Item Name is in column 6
      } else {
        entryCol = 5; // Location (Store/Customer) is in column 5
      }
      
      const entryLastRow = entrySheet.getLastRow();
      const entryRange = entrySheet.getRange(2, entryCol, entryLastRow - 1, 1);
      
      // Use textFinder to replace all occurrences
      const entryFinder = entryRange.createTextFinder(value).matchEntireCell(true);
      entryFinder.replaceAllWith(newValue);
    }
  }

  return getDropdownData();
}

/**
 * Common logic to prepare rows for insertion.
 */
function prepareRows(formData, sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["SNo", "Type", "Date", "Challan No", "Location", "Item Name", "Qty"]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#f3f3f3");
  }

  const type = formData.type;
  
  // Create Date Object
  let date = formData.date; 
  if (formData.date) {
    const parts = formData.date.split('-');
    if (parts.length === 3) {
      // Create local date (Month is 0-indexed)
      date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
  }

  // Force String for Challan
  const challanNo = "'" + (formData.challanNo || "");
  const location = formData.location;

  const itemNames = Array.isArray(formData.itemName) ? formData.itemName : [formData.itemName];
  const quantities = Array.isArray(formData.qty) ? formData.qty : [formData.qty];

  const lastRow = sheet.getLastRow();
  let nextSNo = 1;
  if (lastRow > 1) {
    const lastSNoValue = sheet.getRange(lastRow, 1).getValue();
    nextSNo = isNaN(parseInt(lastSNoValue)) ? 1 : parseInt(lastSNoValue) + 1;
  }

  const rowsToAppend = [];
  for (let i = 0; i < itemNames.length; i++) {
    const itemName = itemNames[i] ? itemNames[i].trim() : "";
    const qty = quantities[i];
    if (itemName !== "" || qty !== "") {
      rowsToAppend.push([nextSNo++, type, date, challanNo, location, itemName, qty]);
    }
  }

  if (rowsToAppend.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, 7).setValues(rowsToAppend);
  }
  return rowsToAppend.length;
}

/**
 * Processes the form data and appends rows to the "Entry" sheet.
 */
function processForm(formData) {
  try {
    const count = prepareRows(formData, "Entry");
    if (count === 0) throw new Error("Please add at least one item.");
    return { status: "success", message: `Successfully added ${count} entries to the sheet.` };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}

/**
 * Saves form data as a JSON string to UserProperties.
 */
function saveUserDraft(formData) {
  try {
    const props = PropertiesService.getUserProperties();
    props.setProperty('DRAFT_FORM', JSON.stringify(formData));
    return { status: "success", message: "Draft saved successfully. You can resume later." };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}

/**
 * Retrieves the saved draft.
 */
function getUserDraft() {
  try {
    const props = PropertiesService.getUserProperties();
    const json = props.getProperty('DRAFT_FORM');
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Clears the saved draft.
 */
function clearUserDraft() {
  try {
    PropertiesService.getUserProperties().deleteProperty('DRAFT_FORM');
    return { status: "success" };
  } catch (e) {
    return { status: "error" };
  }
}

/**
 * Deprecated: Legacy sheet draft (leaving stub if needed or replacing entirely)
 * Replacing with a wrapper to keep button working if frontend isn't updated instantly
 */
function saveDraft(formData) {
  return saveUserDraft(formData);
}

/**
 * Fetches all entry rows that share the same Challan No as the selected row.
 */
function getEntryDataByChallan(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Entry');
  
  if (!sheet || rowIndex < 2) {
    return null;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  
  // Get Challan No from selected row (Column D = index 4)
  const challanNo = sheet.getRange(rowIndex, 4).getValue();
  
  if (!challanNo) {
    return null;
  }
  
  // Read all data
  const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  
  // Normalize challan for comparison
  const targetChallan = String(challanNo).replace(/^'/, '');
  
  // Filter rows with matching Challan No
  const matchingRows = data.filter(row => String(row[3]).replace(/^'/, '') === targetChallan);
  
  if (matchingRows.length === 0) return null;
  
  // Strategy: Try to get data from the specifically selected row first
  // rowIndex is 1-based, data starts at row 2. So data index = rowIndex - 2.
  const selectedRowData = (rowIndex - 2 >= 0 && rowIndex - 2 < data.length) ? data[rowIndex - 2] : null;
  
  // Check if selected row matches the challan (sanity check) and has location
  let location = "";
  let type = "";
  let dateValue = "";
  
  // Scan all matching rows for any non-empty locations
  const distinctLocations = new Set();
  matchingRows.forEach(row => {
    if (row[4]) distinctLocations.add(String(row[4]).trim());
  });
  
  // Strategy: 
  // 1. Prefer selected row's location if valid.
  // 2. Else take the first valid location found in the group.
  
  if (selectedRowData && selectedRowData[4]) {
      location = String(selectedRowData[4]).trim();
  } else if (distinctLocations.size > 0) {
      location = distinctLocations.values().next().value;
  }
  
  // Fallback for Type/Date if selected row was bad and loop didn't set (unlikely)
  if (!type && matchingRows.length > 0) type = matchingRows[0][1];
  if (!dateValue && matchingRows.length > 0) dateValue = matchingRows[0][2];
  
  // Format date back to YYYY-MM-DD for HTML input
  let dateStr = '';
  if (dateValue) {
    if (dateValue instanceof Date) {
      // Use script timezone to avoid date shifting
      dateStr = Utilities.formatDate(dateValue, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
    } else {
      // Handle legacy string DD/MM/YYYY
      const parts = String(dateValue).split('/');
      if (parts.length === 3) {
        dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
      } else {
        // Fallback for random strings? Just try to keep it or ignore
        // If it's already YYYY-MM-DD?
        if (String(dateValue).match(/^\d{4}-\d{2}-\d{2}$/)) {
           dateStr = String(dateValue);
        }
      }
    }
  }
  
  // Extract items
  const items = matchingRows.map(row => ({
    itemName: row[5] || '', // Column F
    qty: row[6] || 1 // Column G
  }));
  
  return {
    type: type,
    date: dateStr,
    challanNo: targetChallan,
    location: location,
    foundLocations: Array.from(distinctLocations),
    items: items
  };
}

/**
 * Updates entry data by deleting old rows and inserting new ones.
 */
function updateEntryData(originalChallan, formData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Entry');
    
    if (!sheet) {
      throw new Error('Entry sheet not found');
    }
    
    // Find and delete all rows with the original Challan No
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      throw new Error('No entries to update');
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    const rowsToDelete = [];
    
    // Find rows to delete (in reverse order to avoid index shifting)
    for (let i = data.length - 1; i >= 0; i--) {
      if (String(data[i][3]).replace(/^'/, '') === String(originalChallan).replace(/^'/, '')) {
        rowsToDelete.push(i + 2); // +2 because array is 0-indexed and sheet starts at row 2
      }
    }
    
    // Delete rows
    rowsToDelete.forEach(rowNum => {
      sheet.deleteRow(rowNum);
    });
    
    // Insert new rows using existing prepareRows logic
    const count = prepareRows(formData, 'Entry');
    
    if (count === 0) {
      throw new Error('No items to save');
    }
    
    return { status: 'success', message: `Successfully updated ${count} entries.` };
    
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Deletes all entries with the specified Challan No.
 */
function deleteEntryByChallan(challanNo) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Entry');
    
    if (!sheet) {
      throw new Error('Entry sheet not found');
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      throw new Error('No entries to delete');
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    const rowsToDelete = [];
    
    // Find rows to delete (in reverse order)
    for (let i = data.length - 1; i >= 0; i--) {
      if (String(data[i][3]).replace(/^'/, '') === String(challanNo).replace(/^'/, '')) {
        rowsToDelete.push(i + 2);
      }
    }
    
    if (rowsToDelete.length === 0) {
      throw new Error('No matching entries found');
    }
    
    // Delete rows
    rowsToDelete.forEach(rowNum => {
      sheet.deleteRow(rowNum);
    });
    
    return { status: 'success', message: `Successfully deleted ${rowsToDelete.length} entries.` };
    
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize buttons and sections
    const mainTableBtn = document.getElementById('mainTableBtn');
    const calendarBtn = document.getElementById('calendarBtn');
    const groupSection = document.querySelector('.group-section');
    const calendarSection = document.querySelector('.calendar-section');
    const addGroupBtn = document.getElementById('addGroupBtn');
    const groupContainer = document.querySelector('.group-container');
    const projectNameElement = document.getElementById('projectName');
    const projectDescriptionElement = document.getElementById('projectDescription');

    if (!mainTableBtn || !calendarBtn || !groupSection || !calendarSection || !addGroupBtn || !groupContainer || !projectNameElement || !projectDescriptionElement) {
        console.error('One or more DOM elements are missing');
        return;
    }

    // Data structure to store group information
    let groupData = JSON.parse(localStorage.getItem('groupData')) || [];

    // Load group data from localStorage
    loadGroups();

    // Prevent the default context menu from appearing
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Event listeners for buttons
    mainTableBtn.addEventListener('click', function() {
        groupSection.classList.add('active-section');
        calendarSection.classList.remove('active-section');
        setActiveButton('mainTableBtn');
    });

    calendarBtn.addEventListener('click', function() {
        groupSection.classList.remove('active-section');
        calendarSection.classList.add('active-section');
        setActiveButton('calendarBtn');
        renderCalendar(); // Ensure calendar is rendered when the button is clicked
    });

    // Set main table as the default active section on page load
    groupSection.classList.add('active-section');
    calendarSection.classList.remove('active-section');
    setActiveButton('mainTableBtn');

    // Add Group functionality
    addGroupBtn.addEventListener('click', function() {
        const groupHeader = prompt("Enter group header:");
        if (!groupHeader) return;

        const groupId = `group-${Date.now()}`;
        const groupCard = createGroupCard(groupId, groupHeader);
        groupContainer.appendChild(groupCard);

        // Add new group to groupData
        groupData.push({ id: groupId, header: groupHeader, rows: [] });
        saveGroups();

        // Add predefined columns and rows to the group table
        const table = groupCard.querySelector('table');
        addPredefinedColumnsAndRows(table, groupId);
    });

    function setActiveButton(buttonId) {
        mainTableBtn.classList.remove('active');
        calendarBtn.classList.remove('active');
        document.getElementById(buttonId).classList.add('active');
    }

    function createGroupCard(groupId, groupHeader) {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.dataset.id = groupId;
    
        const header = document.createElement('h3');
        header.textContent = groupHeader;
        groupCard.appendChild(header);
    
        const table = createTable(groupId);
        groupCard.appendChild(table);
    
        // Add the "Add Item" button
        const addRowBtn = createAddRowButton(table, groupId);
        groupCard.appendChild(addRowBtn);
    
        // Create an invisible context menu for the table header
        const headerContextMenu = createDropdownMenu(
            [
                'Delete Group',
                {
                    label: 'Add Column',
                    submenu: ['Numbers', 'Upload Files', 'Text']
                }
            ],
            (option) => {
                if (option === 'Delete Group') {
                    deleteGroup(groupId);
                } else if (option === 'Numbers' || option === 'Upload Files' || option === 'Text') {
                    addColumn(option, table);
                }
            }
        );
        headerContextMenu.classList.add('header-context-menu');
        document.body.appendChild(headerContextMenu);
    
        // Add event listener for right-click on the table header
        table.querySelector('tr').addEventListener('contextmenu', function(e) {
            e.preventDefault();
            headerContextMenu.style.top = `${e.clientY}px`;
            headerContextMenu.style.left = `${e.clientX}px`;
            headerContextMenu.style.display = 'block';
        });
    
        return groupCard;
    }

    function createTable(groupId) {
        const table = document.createElement('table');
        table.className = 'group-table';
        table.dataset.id = groupId;

        const headerRow = createHeaderRow();
        table.appendChild(headerRow);

        return table;
    }

    function createHeaderRow() {
        const headerRow = document.createElement('tr');
        const columns = ['Text', 'Key Persons', 'Status', 'Start Date', 'Due Date'];
        
        columns.forEach(column => {
            headerRow.appendChild(createHeaderCell(column, '', true));
        });

        return headerRow;
    }

    function createDropdownMenu(options, onSelect) {
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        menu.style.display = 'none';
        menu.style.position = 'absolute'; // Ensure the menu is positioned absolutely
    
        options.forEach(option => {
            if (typeof option === 'string') {
                const item = document.createElement('div');
                item.textContent = option;
                item.className = 'dropdown-item';
                item.addEventListener('click', (e) => {
                    onSelect(option, menu.row);
                    menu.style.display = 'none';
                });
                menu.appendChild(item);
            } else if (typeof option === 'object') {
                const item = document.createElement('div');
                item.className = 'dropdown-item submenu-item';
                item.textContent = option.label;
                item.style.position = 'relative';
    
                const marker = document.createElement('span');
                marker.textContent = '▶';
                marker.className = 'submenu-marker';
                item.appendChild(marker);
    
                const submenu = createDropdownMenu(option.submenu, onSelect);
                submenu.classList.add('submenu');
                item.appendChild(submenu);
    
                item.addEventListener('mouseenter', () => {
                    submenu.style.display = 'block';
                    submenu.style.top = `${item.offsetTop}px`;
                    submenu.style.left = `${item.offsetWidth}px`;
                });
    
                item.addEventListener('mouseleave', () => {
                    submenu.style.display = 'none';
                });
    
                menu.appendChild(item);
            }
        });
    
        document.body.appendChild(menu);
        return menu;
    }

    function createHeaderCell(text, className = '', editable = false, columnId = null) {
        const header = document.createElement('th');
        header.textContent = text;
        header.className = className;
        if (editable) {
            header.addEventListener('dblclick', () => {
                header.contentEditable = true;
                header.focus();
            });
            header.addEventListener('blur', () => {
                header.contentEditable = false;
                saveGroups(); // Save changes on blur
            });
            header.dataset.columnId = columnId;
        }
        return header;
    }

    function addColumn(option, table) {
        const headerRow = table.querySelector('tr');
        const columnExists = Array.from(headerRow.cells).some(cell => cell.textContent === option);
        if (columnExists) return;

        const newHeader = createHeaderCell(option, '', true);
        headerRow.appendChild(newHeader);

        Array.from(table.rows).forEach((row, index) => {
            if (index === 0) return;
            const newCell = createCell(option, row);
            row.appendChild(newCell);
        });
        saveGroups();
    }

    function addTimelineColumns(table) {
        const headerRow = table.querySelector('tr');
        const timelineColumns = ['Start Date', 'Due Date'];
        const existingColumns = Array.from(headerRow.cells).map(cell => cell.textContent);

        timelineColumns.forEach(dateColumn => {
            if (!existingColumns.includes(dateColumn)) {
                const newHeader = createHeaderCell(dateColumn, '', true);
                headerRow.appendChild(newHeader);

                Array.from(table.rows).forEach((row) => {
                    const dateCell = createDateCell(row, dateColumn);
                    row.appendChild(dateCell);

                    const dateInput = dateCell.querySelector('input[type="date"]');
                    dateInput.addEventListener('change', () => syncDateToCalendar(dateInput.value));
                });
            }
        });
        saveGroups();
    }

    function addPredefinedColumnsAndRows(table, groupId) {
        const predefinedColumns = ['Text', 'Key Persons', 'Status', 'Start Date', 'Due Date'];
        predefinedColumns.forEach(option => {
            if (option === 'Start Date' || option === 'Due Date') {
                addTimelineColumns(table);
            } else {
                addColumn(option, table);
            }
        });

        // Add 3 rows to the table
        for (let i = 0; i < 3; i++) {
            addRow(table);
        }
    }

    // Update this function to attach the context menu to new rows
    function addRow(table) {
        const headerRow = table.querySelector('tr');
        const tr = document.createElement('tr');
        tr.dataset.rowId = `row-${Date.now()}`;
    
        Array.from(headerRow.cells).forEach((header) => {
            const cell = createCell(header.textContent, tr);
            tr.appendChild(cell);
        });
    
        table.appendChild(tr);
        saveGroups();
        createRowContextMenu(tr); // Attach the context menu to the new row
    }
    
    function createAddRowButton(table, groupId) {
        const addRowBtn = document.createElement('button');
        addRowBtn.className = 'add-item-btn';
        addRowBtn.dataset.id = groupId;
        addRowBtn.textContent = 'Add Item';
        addRowBtn.addEventListener('click', () => addRow(table));
        return addRowBtn;
    }

    function createCell(headerText, row) {
        const cell = document.createElement('td');
        cell.dataset.columnId = headerText; // Use header text as column ID for simplicity
    
        if (headerText === 'Start Date' || headerText === 'Due Date') {
            return createDateCell(row, headerText);
        } else if (headerText === 'Text' || headerText === 'Key Persons') {
            cell.addEventListener('dblclick', () => {
                cell.contentEditable = true;
                cell.focus();
            });
            cell.addEventListener('blur', () => {
                cell.contentEditable = false;
                updateRowData(row, headerText, cell.textContent);
            });
        } else if (headerText === 'Status') {
            const select = createSelect(['To-do', 'In Progress', 'Done']);
            select.addEventListener('change', () => {
                updateRowData(row, headerText, select.value);
            });
            cell.appendChild(select);
        } else if (headerText === 'Upload File') {
            const fileInput = createInput('file');
            fileInput.addEventListener('change', handleFileUpload);
            cell.appendChild(fileInput);
        }
    
        return cell;
    }

    function createDateCell(row, headerText) {
        const cell = document.createElement('td');
        const dateInput = createInput('date');
        const dateDisplay = document.createElement('span');
        dateDisplay.className = 'formatted-date';
        dateDisplay.style.cursor = 'pointer';
        dateDisplay.style.display = 'none';
    
        dateInput.addEventListener('change', () => {
            const date = new Date(dateInput.value);
            if (!isNaN(date)) {
                dateDisplay.textContent = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                dateInput.style.display = 'none';
                dateDisplay.style.display = 'block';
    
                updateRowData(row, headerText, dateInput.value);
                syncDateToCalendar(dateInput.value);
            }
        });
    
        dateDisplay.addEventListener('dblclick', () => {
            dateInput.style.display = 'block';
            dateDisplay.style.display = 'none';
        });
    
        cell.appendChild(dateInput);
        cell.appendChild(dateDisplay);
        return cell;
    }

    function createInput(type, placeholder = '') {
        const input = document.createElement('input');
        input.type = type;
        input.style.width = '100%';
        if (placeholder) input.placeholder = placeholder;
        return input;
    }

    function createSelect(options) {
        const select = document.createElement('select');
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
        return select;
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('File content:', e.target.result);
            };
            reader.readAsDataURL(file);
        }
        saveGroups();
    }

    function updateRowData(row, column, value) {
        const groupId = row.closest('table').dataset.id;
        const group = groupData.find(g => g.id === groupId);
        if (group) {
            let existingRow = group.rows.find(r => r.id === row.dataset.rowId);
            if (!existingRow) {
                existingRow = { id: row.dataset.rowId || Date.now().toString() };
                group.rows.push(existingRow);
            }
            existingRow[column] = value;
        }
        saveGroups();
    }

    function deleteGroup(groupId) {
        const groupIndex = groupData.findIndex(group => group.id === groupId);
        if (groupIndex !== -1) {
            groupData.splice(groupIndex, 1);
            document.querySelector(`.group-card[data-id="${groupId}"]`).remove();
            saveGroups();
        }
    }

    function saveGroups() {
        localStorage.setItem('groupData', JSON.stringify(groupData));
    }

    // Update this function to attach the context menu to each row
    function loadGroups() {
        groupData.forEach(group => {
            const groupCard = createGroupCard(group.id, group.header);
            groupContainer.appendChild(groupCard);
    
            const table = groupCard.querySelector('table');
            const headerRow = table.querySelector('tr');
    
            group.rows.forEach(rowData => {
                const row = document.createElement('tr');
                row.dataset.rowId = rowData.id;
    
                Array.from(headerRow.cells).forEach(cell => {
                    const cellData = rowData[cell.textContent] || '';
                    const newCell = createCell(cell.textContent, row);
                    if (cellData) {
                        if (cell.textContent === 'Start Date' || cell.textContent === 'Due Date') {
                            newCell.querySelector('input[type="date"]').value = cellData;
                            newCell.querySelector('.formatted-date').textContent = new Date(cellData).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                            newCell.querySelector('.formatted-date').style.display = 'block';
                            newCell.querySelector('input[type="date"]').style.display = 'none';
                        } else if (cell.textContent === 'Status') {
                            newCell.querySelector('select').value = cellData;
                        } else {
                            newCell.textContent = cellData;
                        }
                    }
                    row.appendChild(newCell);
                });
    
                table.appendChild(row);
                createRowContextMenu(row); // Attach the context menu to the row
            });
        });
    }

    // Calendar Variables
    const calendarGrid = document.querySelector('.calendar-grid');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let pinnedDates = [];

    // Function to Render Calendar
    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        monthYearDisplay.textContent = `${new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long' })} ${currentYear}`;

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day');
            calendarGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.textContent = day;
            dayCell.classList.add('calendar-day');
            const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (pinnedDates.includes(fullDate)) {
                dayCell.classList.add('pinned');
            }

            // Display group information in the calendar
            groupData.forEach(group => {
                group.rows.forEach(row => {
                    if (row['Start Date'] === fullDate || row['Due Date'] === fullDate) {
                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'calendar-info';
                        infoDiv.textContent = `${group.header}: ${row['Text'] || ''} (${row['Key Persons'] || ''})`;

                        // Color code based on status
                        if (row['Status'] === 'To-do') {
                            infoDiv.classList.add('status-todo');
                        } else if (row['Status'] === 'In Progress') {
                            infoDiv.classList.add('status-in-progress');
                        } else if (row['Status'] === 'Done') {
                            infoDiv.classList.add('status-done');
                        }

                        dayCell.appendChild(infoDiv);
                    }
                });
            });

            dayCell.addEventListener('click', () => togglePinDate(fullDate, dayCell));
            calendarGrid.appendChild(dayCell);
        }
    }

    // Function to Toggle Pin Date
    function togglePinDate(date, dayCell) {
        if (pinnedDates.includes(date)) {
            pinnedDates = pinnedDates.filter(d => d !== date);
            dayCell.classList.remove('pinned');
        } else {
            pinnedDates.push(date);
            dayCell.classList.add('pinned');
        }
        renderCalendar();
    }

    // Navigation Buttons for Calendar
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Initialize Calendar
    document.addEventListener('DOMContentLoaded', renderCalendar);

    // Function to get URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Set project name and description from URL parameters
    document.addEventListener('DOMContentLoaded', () => {
        const projectName = getUrlParameter('projectName');
        const projectDescription = getUrlParameter('projectDescription');

        if (projectName) {
            projectNameElement.textContent = projectName;
        }
        if (projectDescription) {
            projectDescriptionElement.textContent = projectDescription;
        }
    });
});

//checks user status
function checkUserStatus() {
    const userStatus = localStorage.getItem('userStatus');
    return userStatus;
}

// function to delete a row via context menu
// Add this function to create the context menu for rows
function createRowContextMenu(row) {
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.style.display = 'none';
    menu.style.position = 'absolute'; // Ensure the menu is positioned absolutely

    const deleteItem = document.createElement('div');
    deleteItem.textContent = 'Delete Row';
    deleteItem.className = 'dropdown-item';
    deleteItem.addEventListener('click', () => {
        deleteRow(row);
        menu.style.display = 'none';
    });
    menu.appendChild(deleteItem);

    document.body.appendChild(menu);

    row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        menu.style.top = `${e.clientY + scrollTop}px`;
        menu.style.left = `${e.clientX + scrollLeft}px`;
        menu.style.display = 'block';
    });

    document.addEventListener('click', () => {
        menu.style.display = 'none';
    });

    return menu;
}

// function to delete a row
function deleteRow(row) {
    const table = row.closest('table');
    const groupId = table.dataset.id;
    const rowId = row.dataset.rowId;

    // Find the group in the groupData array
    const group = groupData.find(g => g.id === groupId);
    if (group) {
        // Filter out the row to be deleted from the group's rows
        group.rows = group.rows.filter(r => r.id !== rowId);
        // Remove the row from the DOM
        row.parentNode.removeChild(row);
        // Save the updated group data to localStorage
        saveGroups();
        console.log(`Row with ID ${rowId} deleted from group ${groupId}`);
    } else {
        console.error(`Group with ID ${groupId} not found`);
    }
}
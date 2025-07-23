// Initiative Tree Manager
// Manages the initiative tree and Gantt chart filters

class InitiativeTreeManager {
    constructor(dataGantt) {
        this.dataGantt = dataGantt;
        this.originalDataGantt = [...dataGantt]; 
        this.treeContainer = null;
        this.init();
    }

    init() {
        this.treeContainer = document.getElementById('initiativeTree');
        if (!this.treeContainer) {
            return;
        }

        this.createTree();
        this.addEventListeners();
    }

    // Function to create the initiative tree
    createTree() {
        this.treeContainer.innerHTML = '';
        const initiativeStructure = this.buildInitiativeStructure();

        initiativeStructure.forEach(resource => {
            const resourceItem = this.createTreeItem(resource, 1);
            this.treeContainer.appendChild(resourceItem);

            if (resource.categories && resource.categories.length > 0) {
                resource.categories.forEach(category1 => {
                    const category1Item = this.createTreeItem(category1, 2);
                    this.treeContainer.appendChild(category1Item);

                    if (category1.subcategories && category1.subcategories.length > 0) {
                        category1.subcategories.forEach(category2 => {
                            const category2Item = this.createTreeItem(category2, 3);
                            this.treeContainer.appendChild(category2Item);
                        });
                    }
                });
            }
        });
    }

    // Function to build the hierarchical structure of initiatives
    buildInitiativeStructure() {
        const structure = [];
        const resourceMap = new Map();

        this.dataGantt.forEach(item => {
            if (!resourceMap.has(item.resource)) {
                resourceMap.set(item.resource, {
                    name: item.resource,
                    id: `resource-${item.resource}`,
                    type: 'resource',
                    categories: new Map(),
                    count: 0
                });
            }

            const resource = resourceMap.get(item.resource);
            resource.count++;

            const category1Name = item.initiativeCategory1;
            if (category1Name && category1Name.trim() !== '' && category1Name !== 'N/A') {
                if (!resource.categories.has(category1Name)) {
                    resource.categories.set(category1Name, {
                        name: category1Name,
                        id: `category1-${item.resource}-${category1Name}`,
                        type: 'category1',
                        subcategories: new Map(),
                        count: 0
                    });
                }

                const category1 = resource.categories.get(category1Name);
                category1.count++;

                const category2Name = item.initiativeCategory2;
                if (category2Name && category2Name.trim() !== '' && category2Name !== 'N/A') {
                    if (!category1.subcategories.has(category2Name)) {
                        category1.subcategories.set(category2Name, {
                            name: category2Name,
                            id: `category2-${item.resource}-${category1Name}-${category2Name}`,
                            type: 'category2',
                            count: 0
                        });
                    }

                    const category2 = category1.subcategories.get(category2Name);
                    category2.count++;
                }
            }
        });

        resourceMap.forEach(resource => {
            const resourceData = {
                name: resource.name,
                id: resource.id,
                type: resource.type,
                count: resource.count,
                categories: []
            };

            resource.categories.forEach(category1 => {
                const category1Data = {
                    name: category1.name,
                    id: category1.id,
                    type: category1.type,
                    count: category1.count,
                    subcategories: []
                };

                category1.subcategories.forEach(category2 => {
                    category1Data.subcategories.push({
                        name: category2.name,
                        id: category2.id,
                        type: category2.type,
                        count: category2.count
                    });
                });

                resourceData.categories.push(category1Data);
            });

            structure.push(resourceData);
        });

        return structure;
    }

    // Function to create a tree item
    createTreeItem(item, level) {
        const treeItem = document.createElement('div');
        treeItem.className = `initiative-tree-item level-${level}`;
        treeItem.setAttribute('data-id', item.id);
        treeItem.setAttribute('data-type', item.type);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'initiative-tree-checkbox';
        checkbox.id = `checkbox-${item.id}`;
        checkbox.checked = true;

        const label = document.createElement('label');
        label.className = 'initiative-tree-label';
        label.htmlFor = `checkbox-${item.id}`;
        label.textContent = item.name || 'N/A';

        const count = document.createElement('span');
        count.className = 'initiative-tree-count';
        count.textContent = item.count;

        treeItem.appendChild(checkbox);
        treeItem.appendChild(label);
        treeItem.appendChild(count);

        checkbox.addEventListener('change', (e) => this.handleCheckboxChange(e));
        label.addEventListener('click', () => checkbox.click());

        return treeItem;
    }

    // Function to handle changes in tree checkboxes
    handleCheckboxChange(event) {
        const checkbox = event.target;
        const treeItem = checkbox.closest('.initiative-tree-item');
        const itemId = treeItem.getAttribute('data-id');
        const itemType = treeItem.getAttribute('data-type');
        const isChecked = checkbox.checked;

        this.updateRelatedCheckboxes(treeItem, isChecked);
        this.updateInitiativeVisibility(itemId, itemType, isChecked);
    }

    // Helper method to update table and arrows
    updateTableAndArrows() {
        if (typeof updateTable === 'function') {
            updateTable();
        }
        
        if (typeof removeDuplicateSubGroups === 'function') {
            removeDuplicateSubGroups();
        }
        if (typeof removeDuplicateGroupHeaders === 'function') {
            removeDuplicateGroupHeaders();
        }
        if (typeof updateTooltipVisibility === 'function') {
            updateTooltipVisibility();
        }
        
        this.callAfterGroupHeaders();
        
        // Execute slider events before drawing arrows
        this.executeSliderEvents();
    }

    // Function to execute slider events to update sizes
    executeSliderEvents() {
        // Execute widthSlider event (height control)
        const widthSlider = document.getElementById('widthSlider');
        if (widthSlider) {
            const width = widthSlider.value;
            const widthValue = document.getElementById('widthValue');
            if (widthValue) {
                widthValue.textContent = `${width}`;
            }
            
            // Apply padding to scrollable table content cells (excluding month-header)
            const monthCells = document.querySelectorAll('.scrollable-table .month-cell:not(.month-header)');
            monthCells.forEach(element => {
                element.style.paddingBottom = `${width}px`;
                element.style.paddingTop = `${width}px`;
            });
            
            // Apply padding to fixed table initiative columns to maintain synchronization
            const fixedInitiativeCells = document.querySelectorAll('.fixed-table .group-header, .fixed-table .sub-group, .fixed-table .sub-sub-group');
            fixedInitiativeCells.forEach(element => {
                element.style.paddingBottom = `${width}px`;
                element.style.paddingTop = `${width}px`;
            });
        }
        
        // Execute cellSizeSlider event (width control)
        const cellSizeSlider = document.getElementById('cellSizeSlider');
        if (cellSizeSlider) {
            const size = cellSizeSlider.value;
            const sizeValue = document.getElementById('sizeValue');
            if (sizeValue) {
                sizeValue.textContent = `${size}`;
            }
            
            if (typeof updateCellSize === 'function') {
                updateCellSize(size);
            }
        }
        
        // Synchronize heights after slider updates
        setTimeout(() => {
            if (typeof syncHeaderHeight === 'function') {
                syncHeaderHeight();
            }
            if (typeof syncRowHeights === 'function') {
                syncRowHeights();
            }
        }, 100);
    }

    // Function to update initiative visibility
    updateInitiativeVisibility(itemId, itemType, isVisible) {
        this.filterDataGantt();
        this.updateTableAndArrows();
    }
    
    // Function to filter JSON data based on tree selection
    filterDataGantt() {
        const checkboxes = document.querySelectorAll('.initiative-tree-checkbox');
        const selectedItems = new Set();
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked || checkbox.indeterminate) {
                const treeItem = checkbox.closest('.initiative-tree-item');
                const itemId = treeItem.getAttribute('data-id');
                const itemType = treeItem.getAttribute('data-type');
                selectedItems.add(`${itemType}:${itemId}`);
            }
        });
        
        const originalDataGantt = this.originalDataGantt;
        
        const filteredData = originalDataGantt.filter(item => {
            const resourceId = `resource:resource-${item.resource}`;
            if (!selectedItems.has(resourceId)) {
                return false;
            }
            
            if (item.initiativeCategory1 && item.initiativeCategory1.trim() !== '' && item.initiativeCategory1 !== 'N/A') {
                const category1Id = `category1:category1-${item.resource}-${item.initiativeCategory1}`;
                if (!selectedItems.has(category1Id)) {
                    return false;
                }
            }
            
            if (item.initiativeCategory2 && item.initiativeCategory2.trim() !== '' && item.initiativeCategory2 !== 'N/A') {
                const category2Id = `category2:category2-${item.resource}-${item.initiativeCategory1}-${item.initiativeCategory2}`;
                if (!selectedItems.has(category2Id)) {
                    return false;
                }
            }
            
            return true;
        });
        
        dataGantt.length = 0;
        dataGantt.push(...filteredData);
    }

    // Function to update related checkboxes
    updateRelatedCheckboxes(treeItem, isChecked) {
        const itemType = treeItem.getAttribute('data-type');
        const itemId = treeItem.getAttribute('data-id');

        if (itemType === 'resource') {
            const resourceId = itemId;
            const categoryItems = document.querySelectorAll(`[data-id^="category1-${resourceId.replace('resource-', '')}"]`);
            const category2Items = document.querySelectorAll(`[data-id^="category2-${resourceId.replace('resource-', '')}"]`);

            categoryItems.forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = isChecked;
                    checkbox.indeterminate = false;
                }
            });

            category2Items.forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = isChecked;
                    checkbox.indeterminate = false;
                }
            });
        } else if (itemType === 'category1') {
            const categoryId = itemId;
            const subcategoryItems = document.querySelectorAll(`[data-id^="category2-${categoryId.replace('category1-', '')}"]`);

            subcategoryItems.forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = isChecked;
                    checkbox.indeterminate = false;
                }
            });

            this.updateParentCheckboxState(treeItem);
        } else if (itemType === 'category2') {
            this.updateParentCheckboxState(treeItem);
        }
    }

    // Function to update parent checkbox state
    updateParentCheckboxState(treeItem) {
        const itemType = treeItem.getAttribute('data-type');
        const itemId = treeItem.getAttribute('data-id');

        if (itemType === 'category2') {
            const category1Id = itemId.replace(/^category2-([^-]+-[^-]+)-.*/, 'category1-$1');
            const category1Item = document.querySelector(`[data-id="${category1Id}"]`);
            
            if (category1Item) {
                this.updateCheckboxState(category1Item);
            }
        } else if (itemType === 'category1') {
            const resourceId = itemId.replace(/^category1-([^-]+)-.*/, 'resource-$1');
            const resourceItem = document.querySelector(`[data-id="${resourceId}"]`);
            
            if (resourceItem) {
                this.updateCheckboxState(resourceItem);
            }
        }
    }

    // Function to update checkbox state based on children
    updateCheckboxState(treeItem) {
        const itemType = treeItem.getAttribute('data-type');
        const itemId = treeItem.getAttribute('data-id');
        const checkbox = treeItem.querySelector('input[type="checkbox"]');

        if (!checkbox) return;

        let childCheckboxes = [];

        if (itemType === 'resource') {
            const categoryItems = document.querySelectorAll(`[data-id^="category1-${itemId.replace('resource-', '')}"]`);
            categoryItems.forEach(item => {
                const childCheckbox = item.querySelector('input[type="checkbox"]');
                if (childCheckbox) childCheckboxes.push(childCheckbox);
            });
        } else if (itemType === 'category1') {
            const subcategoryItems = document.querySelectorAll(`[data-id^="category2-${itemId.replace('category1-', '')}"]`);
            subcategoryItems.forEach(item => {
                const childCheckbox = item.querySelector('input[type="checkbox"]');
                if (childCheckbox) childCheckboxes.push(childCheckbox);
            });
        }

        if (childCheckboxes.length > 0) {
            const checkedCount = childCheckboxes.filter(cb => cb.checked).length;
            
            if (checkedCount === 0) {
                checkbox.checked = false;
                checkbox.indeterminate = false;
            } else if (checkedCount === childCheckboxes.length) {
                checkbox.checked = true;
                checkbox.indeterminate = false;
            } else {
                checkbox.checked = false;
                checkbox.indeterminate = true;
            }
        }
    }

    // Function to select all initiatives
    selectAllInitiatives() {
        const checkboxes = document.querySelectorAll('.initiative-tree-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            checkbox.indeterminate = false;
        });

        dataGantt.length = 0;
        dataGantt.push(...this.originalDataGantt);

        this.updateTableAndArrows();
    }

    // Function to deselect all initiatives
    deselectAllInitiatives() {
        const checkboxes = document.querySelectorAll('.initiative-tree-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.indeterminate = false;
        });

        dataGantt.length = 0;

        this.updateTableAndArrows();
    }

    // Function to expand all initiatives
    expandAllInitiatives() {
        const treeItems = document.querySelectorAll('.initiative-tree-item');
        treeItems.forEach(item => {
            item.classList.remove('hidden');
        });
    }

    // Function to collapse all initiatives (keep only resources)
    collapseAllInitiatives() {
        const categoryItems = document.querySelectorAll('.initiative-tree-item.level-2, .initiative-tree-item.level-3');
        categoryItems.forEach(item => {
            item.classList.add('hidden');
        });
    }

    // Add event listeners for control buttons
    addEventListeners() {
        const selectAllBtn = document.getElementById('selectAllInitiatives');
        const deselectAllBtn = document.getElementById('deselectAllInitiatives');
        const expandAllBtn = document.getElementById('expandAllInitiatives');
        const collapseAllBtn = document.getElementById('collapseAllInitiatives');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAllInitiatives());
        }
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => this.deselectAllInitiatives());
        }
        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => this.expandAllInitiatives());
        }
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => this.collapseAllInitiatives());
        }
    }

    // Function to execute code after removeDuplicateGroupHeaders
    callAfterGroupHeaders() {
        const showFirstMonthsCheckbox = document.getElementById('showFirstMonthsCheckbox');
        if (showFirstMonthsCheckbox) {
            showFirstMonthsCheckbox.checked = false;
            showFirstMonthsCheckbox.dispatchEvent(new Event('change'));
        }
    }
}

// Export class for global use
window.InitiativeTreeManager = InitiativeTreeManager; 
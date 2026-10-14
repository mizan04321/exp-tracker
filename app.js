/**
 * Amar Khoroch - Personal Expense Tracker
 * Pure Vanilla JavaScript (Zero Dependencies, Offline Capable)
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'amar_khoroch_expenses_v1';
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // --- State ---
  let expenses = [];
  const realToday = new Date();
  let selectedYear = realToday.getFullYear();
  let selectedMonth = realToday.getMonth(); // 0-11
  let activeTab = 'home';
  let pendingDeleteId = null;

  // --- DOM Elements ---
  const tabHome = document.getElementById('tab-home');
  const tabHistory = document.getElementById('tab-history');
  const navBtnHome = document.getElementById('nav-btn-home');
  const navBtnHistory = document.getElementById('nav-btn-history');
  const navBtnAdd = document.getElementById('nav-btn-add');
  const btnQuickAdd = document.getElementById('btn-quick-add');

  // Month navigation
  const btnPrevMonth = document.getElementById('btn-prev-month');
  const btnNextMonth = document.getElementById('btn-next-month');
  const currentMonthDisplay = document.getElementById('current-month-display');
  const btnJumpCurrentMonth = document.getElementById('btn-jump-current-month');

  // Stats elements
  const heroMonthTitle = document.getElementById('hero-month-title');
  const heroMonthTotal = document.getElementById('hero-month-total');
  const heroExpenseCount = document.getElementById('hero-expense-count');
  const statToday = document.getElementById('stat-today');
  const statWeek = document.getElementById('stat-week');
  const statPrevMonth = document.getElementById('stat-prev-month');
  const statPrevMonthLabel = document.getElementById('stat-prev-month-label');

  // Lists
  const monthlyExpenseList = document.getElementById('monthly-expense-list');
  const monthlyListHeading = document.getElementById('monthly-list-heading');
  const monthlyBadgeCount = document.getElementById('monthly-badge-count');
  const allExpenseList = document.getElementById('all-expense-list');
  const historyTotalAmount = document.getElementById('history-total-amount');
  const historyTotalCount = document.getElementById('history-total-count');
  const historyFilteredBadge = document.getElementById('history-filtered-badge');
  const historySearchInput = document.getElementById('history-search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');

  // Modals
  const expenseModal = document.getElementById('expense-modal');
  const modalTitle = document.getElementById('modal-title');
  const expenseForm = document.getElementById('expense-form');
  const editExpenseId = document.getElementById('edit-expense-id');
  const inputExpenseName = document.getElementById('input-expense-name');
  const inputExpenseAmount = document.getElementById('input-expense-amount');
  const inputExpenseDate = document.getElementById('input-expense-date');
  const saveBtnText = document.getElementById('save-btn-text');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelExpense = document.getElementById('btn-cancel-expense');

  // Validation error containers
  const nameError = document.getElementById('name-error');
  const amountError = document.getElementById('amount-error');
  const dateError = document.getElementById('date-error');

  // Delete modal
  const deleteModal = document.getElementById('delete-modal');
  const deleteItemDesc = document.getElementById('delete-item-desc');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');

  // Backup modal
  const backupModal = document.getElementById('backup-modal');
  const btnBackupModal = document.getElementById('btn-backup-modal');
  const btnCloseBackup = document.getElementById('btn-close-backup');
  const btnExportData = document.getElementById('btn-export-data');
  const btnTriggerImport = document.getElementById('btn-trigger-import');
  const fileImportInput = document.getElementById('file-import-input');

  const toastEl = document.getElementById('toast');

  // --- Helper Functions ---

  /** Format a number into Bangladeshi / local currency presentation */
  function formatMoney(amount) {
    if (isNaN(amount) || amount === null) return '0';
    return Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  /** Get local YYYY-MM-DD string for a date */
  function getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /** Format date for display: "Today", "Yesterday", or "14 Oct, 2026" */
  function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const todayStr = getLocalDateString(new Date());
    
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yesterdayStr = getLocalDateString(yest);

    if (dateStr === todayStr) {
      return 'Today';
    }
    if (dateStr === yesterdayStr) {
      return 'Yesterday';
    }

    // Split YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthAbbr = MONTH_NAMES[monthIdx] ? MONTH_NAMES[monthIdx].substring(0, 3) : '';
      return `${day} ${monthAbbr} ${year}`;
    }
    return dateStr;
  }

  /** Auto-assign an emoji icon based on common expense keywords */
  function getCategoryEmoji(name) {
    const lower = (name || '').toLowerCase();
    if (/food|lunch|dinner|breakfast|nasta|biryani|burger|pizza|khabar|rice|sweet|fish|meat/.test(lower)) return '🍔';
    if (/tea|cha|coffee|snack|drink/.test(lower)) return '☕';
    if (/bus|rickshaw|cng|uber|pathao|transport|fare|ticket|train|auto|fuel|petrol|octane/.test(lower)) return '🚌';
    if (/grocer|bazar|vegetable|sabji|oil|bazaar|market/.test(lower)) return '🛒';
    if (/shop|cloth|shirt|pant|shoes|dress|buy|gift/.test(lower)) return '🛍️';
    if (/internet|wifi|mobile|recharge|flexiload|data|phone|bill|broadband/.test(lower)) return '📱';
    if (/medicine|med|doctor|pharma|hospital|clinic|test|tablet|syrup|oushodh/.test(lower)) return '💊';
    if (/rent|electric|gas|water|utility|house|current/.test(lower)) return '⚡';
    if (/book|pen|exam|tuition|school|college|uni|study/.test(lower)) return '📚';
    return '৳';
  }

  /** Show toast message */
  let toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2500);
  }

  // --- Storage Management ---
  function loadExpenses() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        expenses = JSON.parse(raw);
        if (!Array.isArray(expenses)) expenses = [];
      } else {
        // Pre-populate with a couple friendly starter examples if first time
        const todayStr = getLocalDateString(new Date());
        expenses = [
          {
            id: 'demo_1',
            name: 'Food / Lunch',
            amount: 250,
            date: todayStr,
            createdAt: Date.now() - 3600000
          },
          {
            id: 'demo_2',
            name: 'Bus / Transport',
            amount: 50,
            date: todayStr,
            createdAt: Date.now() - 7200000
          }
        ];
        saveExpenses();
      }
    } catch (e) {
      console.error('Failed to parse expenses from localStorage', e);
      expenses = [];
    }
  }

  function saveExpenses() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
      alert('Could not save data. Your browser storage might be full.');
    }
  }

  // --- Calculation Helpers ---

  /** Check if a date string is in the current calendar week (Monday to Sunday) */
  function isDateInCurrentWeek(dateStr) {
    if (!dateStr) return false;
    const now = new Date();
    // Monday as start of week
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const checkDate = new Date(dateStr + 'T00:00:00');
    return checkDate >= startOfWeek && checkDate <= endOfWeek;
  }

  /** Render Dashboard & Lists */
  function renderAll() {
    const todayStr = getLocalDateString(new Date());
    const realYear = realToday.getFullYear();
    const realMonth = realToday.getMonth();

    // 1. Month Selector Header
    currentMonthDisplay.textContent = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    heroMonthTitle.textContent = `Total Spent in ${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    monthlyListHeading.textContent = `Expenses in ${MONTH_NAMES[selectedMonth]}`;

    // Show or hide "Current" jump button
    if (selectedYear === realYear && selectedMonth === realMonth) {
      btnJumpCurrentMonth.style.display = 'none';
    } else {
      btnJumpCurrentMonth.style.display = 'inline-block';
    }

    // 2. Calculate Dashboard Totals
    let totalSelectedMonth = 0;
    let selectedMonthCount = 0;
    let totalToday = 0;
    let totalThisWeek = 0;
    let totalPrevMonth = 0;

    // Previous month relative to current real-time or selected
    let prevM = realMonth - 1;
    let prevY = realYear;
    if (prevM < 0) {
      prevM = 11;
      prevY -= 1;
    }
    const prevMonthName = MONTH_NAMES[prevM];
    statPrevMonthLabel.textContent = `Previous Month (${prevMonthName} ${prevY})`;

    // Filtered lists
    const monthlyList = [];

    expenses.forEach((item) => {
      const amount = Number(item.amount) || 0;

      // Check date
      const parts = item.date.split('-');
      if (parts.length === 3) {
        const itemYear = parseInt(parts[0], 10);
        const itemMonth = parseInt(parts[1], 10) - 1;

        // Selected month
        if (itemYear === selectedYear && itemMonth === selectedMonth) {
          totalSelectedMonth += amount;
          selectedMonthCount++;
          monthlyList.push(item);
        }

        // Previous month (relative to current real time)
        if (itemYear === prevY && itemMonth === prevM) {
          totalPrevMonth += amount;
        }
      }

      // Today
      if (item.date === todayStr) {
        totalToday += amount;
      }

      // This week
      if (isDateInCurrentWeek(item.date)) {
        totalThisWeek += amount;
      }
    });

    // Sort monthly list: newest date first, then newest createdAt first
    monthlyList.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    // Update Top Summary (Hero)
    heroMonthTotal.textContent = formatMoney(totalSelectedMonth);
    heroExpenseCount.textContent = `${selectedMonthCount} expense${selectedMonthCount === 1 ? '' : 's'} recorded`;

    // Update Quick Stats
    statToday.textContent = formatMoney(totalToday);
    statWeek.textContent = formatMoney(totalThisWeek);
    statPrevMonth.textContent = formatMoney(totalPrevMonth);

    // 3. Render Monthly List
    renderExpenseList(monthlyList, monthlyExpenseList, monthlyBadgeCount, true);

    // 4. Render History Tab List
    renderHistory();
  }

  /** Render an expense list container */
  function renderExpenseList(items, containerEl, badgeEl, isMonthlyView) {
    if (badgeEl) {
      badgeEl.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
    }

    if (items.length === 0) {
      const emptyMsg = isMonthlyView
        ? `No expenses recorded for ${MONTH_NAMES[selectedMonth]} ${selectedYear}.`
        : 'No expenses found.';
      
      containerEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💸</div>
          <div class="empty-text">No Expenses Yet</div>
          <div class="empty-subtext">${emptyMsg}</div>
          <button class="empty-cta-btn" onclick="document.getElementById('btn-quick-add').click()">+ Add an Expense</button>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach((item) => {
      const emoji = getCategoryEmoji(item.name);
      const displayDate = formatDisplayDate(item.date);
      const safeName = escapeHtml(item.name);
      const amountStr = formatMoney(item.amount);

      html += `
        <div class="expense-item" data-id="${item.id}">
          <div class="expense-left">
            <div class="expense-avatar">${emoji}</div>
            <div class="expense-info">
              <div class="expense-name">${safeName}</div>
              <div class="expense-date-badge">${displayDate}</div>
            </div>
          </div>
          <div class="expense-right">
            <div class="expense-amount-tag">৳ ${amountStr}</div>
            <div class="expense-actions">
              <button class="item-action-btn edit-btn" data-action="edit" data-id="${item.id}" title="Edit" aria-label="Edit">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="item-action-btn delete-btn" data-action="delete" data-id="${item.id}" title="Delete" aria-label="Delete">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    containerEl.innerHTML = html;
  }

  /** Render the History tab with search filtering */
  function renderHistory() {
    const query = (historySearchInput.value || '').trim().toLowerCase();
    
    // Sort all expenses: newest date first, then newest createdAt
    const sortedAll = [...expenses].sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    // All-time totals
    const grandTotal = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    historyTotalAmount.textContent = formatMoney(grandTotal);
    historyTotalCount.textContent = `${expenses.length} total record${expenses.length === 1 ? '' : 's'}`;

    // Filter by query
    let filtered = sortedAll;
    if (query) {
      filtered = sortedAll.filter(item => {
        return (item.name || '').toLowerCase().includes(query) ||
               (item.date || '').includes(query) ||
               String(item.amount).includes(query);
      });
      btnClearSearch.style.display = 'flex';
    } else {
      btnClearSearch.style.display = 'none';
    }

    renderExpenseList(filtered, allExpenseList, historyFilteredBadge, false);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Modal Management ---

  function openAddModal() {
    editExpenseId.value = '';
    modalTitle.textContent = 'Add Expense';
    saveBtnText.textContent = 'Save Expense';
    
    // Default to today's date
    inputExpenseName.value = '';
    inputExpenseAmount.value = '';
    inputExpenseDate.value = getLocalDateString(new Date());

    clearFormErrors();
    expenseModal.classList.add('open');
    expenseModal.setAttribute('aria-hidden', 'false');

    // Auto focus name input after smooth transition
    setTimeout(() => {
      inputExpenseName.focus();
    }, 200);
  }

  function openEditModal(id) {
    const item = expenses.find(e => e.id === id);
    if (!item) return;

    editExpenseId.value = item.id;
    modalTitle.textContent = 'Edit Expense';
    saveBtnText.textContent = 'Update Expense';
    
    inputExpenseName.value = item.name;
    inputExpenseAmount.value = item.amount;
    inputExpenseDate.value = item.date;

    clearFormErrors();
    expenseModal.classList.add('open');
    expenseModal.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      inputExpenseAmount.focus();
    }, 200);
  }

  function closeModal() {
    expenseModal.classList.remove('open');
    expenseModal.setAttribute('aria-hidden', 'true');
    clearFormErrors();
  }

  function clearFormErrors() {
    inputExpenseName.parentElement.classList.remove('has-error');
    inputExpenseAmount.parentElement.parentElement.classList.remove('has-error');
    inputExpenseDate.parentElement.classList.remove('has-error');
  }

  // --- Form Validation & Submission ---
  expenseForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearFormErrors();

    const name = inputExpenseName.value.trim();
    const amountVal = inputExpenseAmount.value.trim();
    const amount = parseFloat(amountVal);
    const date = inputExpenseDate.value.trim();

    let hasError = false;

    if (!name) {
      inputExpenseName.parentElement.classList.add('has-error');
      hasError = true;
    }

    if (!amountVal || isNaN(amount) || amount <= 0) {
      inputExpenseAmount.parentElement.parentElement.classList.add('has-error');
      hasError = true;
    }

    if (!date) {
      inputExpenseDate.parentElement.classList.add('has-error');
      hasError = true;
    }

    if (hasError) return;

    const id = editExpenseId.value;

    if (id) {
      // Editing existing expense
      const idx = expenses.findIndex(e => e.id === id);
      if (idx !== -1) {
        expenses[idx].name = name;
        expenses[idx].amount = amount;
        expenses[idx].date = date;
        saveExpenses();
        showToast('Expense updated successfully!');
      }
    } else {
      // Adding new expense
      const newExpense = {
        id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: name,
        amount: amount,
        date: date,
        createdAt: Date.now()
      };
      expenses.unshift(newExpense);
      saveExpenses();
      showToast('Expense saved successfully!');

      // If user added an expense in a different month, switch to that month so they see it
      const expDateParts = date.split('-');
      if (expDateParts.length === 3) {
        selectedYear = parseInt(expDateParts[0], 10);
        selectedMonth = parseInt(expDateParts[1], 10) - 1;
      }
    }

    closeModal();
    renderAll();
  });

  // Category quick suggestion chips
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      if (cat) {
        inputExpenseName.value = cat;
        inputExpenseName.parentElement.classList.remove('has-error');
        // Quick jump to amount
        inputExpenseAmount.focus();
      }
    });
  });

  // --- Delete Handling ---
  function promptDelete(id) {
    const item = expenses.find(e => e.id === id);
    if (!item) return;

    pendingDeleteId = id;
    deleteItemDesc.textContent = `Are you sure you want to remove "${item.name}" (৳ ${formatMoney(item.amount)})?`;
    deleteModal.classList.add('open');
    deleteModal.setAttribute('aria-hidden', 'false');
  }

  function closeDeleteModal() {
    deleteModal.classList.remove('open');
    deleteModal.setAttribute('aria-hidden', 'true');
    pendingDeleteId = null;
  }

  btnConfirmDelete.addEventListener('click', () => {
    if (pendingDeleteId) {
      expenses = expenses.filter(e => e.id !== pendingDeleteId);
      saveExpenses();
      showToast('Expense deleted');
      closeDeleteModal();
      renderAll();
    }
  });

  btnCancelDelete.addEventListener('click', closeDeleteModal);

  // Delegate click for edit / delete buttons in lists
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.item-action-btn');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (action === 'edit') {
      openEditModal(id);
    } else if (action === 'delete') {
      promptDelete(id);
    }
  });

  // --- Month Switcher ---
  btnPrevMonth.addEventListener('click', () => {
    selectedMonth -= 1;
    if (selectedMonth < 0) {
      selectedMonth = 11;
      selectedYear -= 1;
    }
    renderAll();
  });

  btnNextMonth.addEventListener('click', () => {
    selectedMonth += 1;
    if (selectedMonth > 11) {
      selectedMonth = 0;
      selectedYear += 1;
    }
    renderAll();
  });

  btnJumpCurrentMonth.addEventListener('click', () => {
    selectedYear = realToday.getFullYear();
    selectedMonth = realToday.getMonth();
    renderAll();
  });

  // --- Bottom Navigation Switch ---
  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'home') {
      tabHome.classList.add('active');
      tabHistory.classList.remove('active');
      navBtnHome.classList.add('active');
      navBtnHistory.classList.remove('active');
    } else {
      tabHistory.classList.add('active');
      tabHome.classList.remove('active');
      navBtnHistory.classList.add('active');
      navBtnHome.classList.remove('active');
      renderHistory();
    }
  }

  navBtnHome.addEventListener('click', () => switchTab('home'));
  navBtnHistory.addEventListener('click', () => switchTab('history'));

  // Open Add Modal buttons
  btnQuickAdd.addEventListener('click', openAddModal);
  navBtnAdd.addEventListener('click', openAddModal);
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelExpense.addEventListener('click', closeModal);

  // Close modals when tapping outside backdrop
  [expenseModal, deleteModal, backupModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // Search in History
  historySearchInput.addEventListener('input', renderHistory);
  btnClearSearch.addEventListener('click', () => {
    historySearchInput.value = '';
    renderHistory();
    historySearchInput.focus();
  });

  // --- Backup & Restore ---
  btnBackupModal.addEventListener('click', () => {
    backupModal.classList.add('open');
    backupModal.setAttribute('aria-hidden', 'false');
  });

  btnCloseBackup.addEventListener('click', () => {
    backupModal.classList.remove('open');
    backupModal.setAttribute('aria-hidden', 'true');
  });

  btnExportData.addEventListener('click', () => {
    const dataStr = JSON.stringify(expenses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amar-khoroch-backup-${getLocalDateString(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup file downloaded!');
  });

  btnTriggerImport.addEventListener('click', () => {
    fileImportInput.click();
  });

  fileImportInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          // Merge or replace: we'll replace or merge unique
          const existingIds = new Set(expenses.map(item => item.id));
          let addedCount = 0;
          
          importedData.forEach(item => {
            if (item && item.name && item.amount && item.date) {
              if (!existingIds.has(item.id)) {
                expenses.push(item);
                addedCount++;
              }
            }
          });

          saveExpenses();
          renderAll();
          backupModal.classList.remove('open');
          showToast(`Restored ${addedCount} new expenses!`);
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Could not read the file. Please ensure it is a valid backup JSON file.');
      }
      fileImportInput.value = '';
    };
    reader.readAsText(file);
  });

  // --- PWA Service Worker Registration ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('ServiceWorker registered with scope: ', reg.scope);
        })
        .catch((err) => {
          console.warn('ServiceWorker registration failed: ', err);
        });
    });
  }

  // --- Initial Boot ---
  loadExpenses();
  renderAll();

})();

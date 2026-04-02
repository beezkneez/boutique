/**
 * Staff demo video scenes.
 * Each scene has a name, narration text, and a Playwright action function.
 */

const {
  highlightElement,
  typeSlowly,
  goToTab,
  scrollTo,
  waitForNarration,
} = require('./demo-helpers');

const APP_URL = 'https://teststudio.demo';
const STAFF_EMAIL = 'judbeasley@gmail.com';
const STAFF_PIN = '1212';

/** @type {Array<{name:string, narration:string, action:(page:import('playwright').Page)=>Promise<void>}>} */
const scenes = [
  // ─── 1. Intro ───
  {
    name: 'intro',
    narration:
      'Welcome to Test Studio, your shift tracking app. Let\'s walk through everything you need to know as a staff member.',
    action: async (page) => {
      await page.goto(APP_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    },
  },

  // ─── 2. Login ───
  {
    name: 'login',
    narration:
      'To get started, enter your email address and your four digit PIN, then click Log In. You\'ll see a loading bar while we verify your credentials.',
    action: async (page) => {
      await highlightElement(page, '#loginEmail');
      await typeSlowly(page, '#loginEmail', STAFF_EMAIL);
      await page.waitForTimeout(400);
      await highlightElement(page, '#loginPin');
      await typeSlowly(page, '#loginPin', STAFF_PIN, 120);
      await page.waitForTimeout(400);
      await highlightElement(page, '#btnLogin');
      await page.waitForTimeout(600);
      await page.click('#btnLogin');
      await page.waitForTimeout(3000);
    },
  },

  // ─── 3. Home Overview ───
  {
    name: 'home-overview',
    narration:
      'This is your home page. At the top you\'ll see the pay period selector, which shows the current and upcoming pay periods. Below that is a summary of your hours, shifts, and estimated pay for the selected period.',
    action: async (page) => {
      await highlightElement(page, '#payPeriodSelect', 3000);
      await page.waitForTimeout(1500);
      await highlightElement(page, '#ppSummary', 3000);
      await scrollTo(page, '#ppSummary');
    },
  },

  // ─── 4. Pay Period Calendar ───
  {
    name: 'calendar',
    narration:
      'The calendar widget shows which days you\'ve already logged shifts. Days with entries are highlighted. You can click any day to quickly set the date for a new entry.',
    action: async (page) => {
      await scrollTo(page, '#calendarCard');
      await highlightElement(page, '#calendarCard', 3000);
      await page.waitForTimeout(2000);
      // Click a day in the calendar grid if available
      const dayCell = page.locator('#calendarGrid td.cal-day').first();
      if (await dayCell.isVisible().catch(() => false)) {
        await dayCell.click();
        await page.waitForTimeout(800);
      }
    },
  },

  // ─── 5. Log a Class ───
  {
    name: 'log-class',
    narration:
      'To log a shift, scroll down to the Log a Class section. Pick a date, choose your location from the dropdown, then click Add Shift. Fill in the class name, start and end times, hours worked, and your hourly rate. The total is calculated automatically. When you\'re ready, click Submit.',
    action: async (page) => {
      await scrollTo(page, '#logClassCard');
      await highlightElement(page, '#logClassCard', 3000);
      await page.waitForTimeout(1000);

      // Fill date
      await highlightElement(page, '#date', 1500);
      const today = new Date().toISOString().split('T')[0];
      await page.fill('#date', today);
      await page.waitForTimeout(500);

      // Select first location if available
      await highlightElement(page, '#location', 1500);
      const options = await page.$$eval('#location option', opts =>
        opts.filter(o => o.value).map(o => o.value)
      );
      if (options.length > 0) {
        await page.selectOption('#location', options[0]);
      }
      await page.waitForTimeout(500);

      // Add a line
      const addBtn = page.locator('#hadd-btn, [onclick*="addLine"]').first();
      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(800);
      }
      await highlightElement(page, '#lines', 2000);
      await scrollTo(page, '#btnSubmit');
      await highlightElement(page, '#btnSubmit', 2000);
      await page.waitForTimeout(500);
    },
  },

  // ─── 6. Log Commission ───
  {
    name: 'log-commission',
    narration:
      'If you earned a commission, use the Commission section. Enter the dollar amount, pick the date, and optionally add a note. Then click Submit Commission.',
    action: async (page) => {
      await scrollTo(page, '#commissionCard');
      await highlightElement(page, '#commissionCard', 3000);
      await page.waitForTimeout(1000);
      await highlightElement(page, '#commissionAmt', 1500);
      await highlightElement(page, '#commissionDate', 1500);
      await highlightElement(page, '#btnCommission', 2000);
    },
  },

  // ─── 7. View Entries ───
  {
    name: 'view-entries',
    narration:
      'Your submitted entries appear below the form. You can switch between card view and table view using these toggle buttons. Scroll through to review all your shifts for the pay period.',
    action: async (page) => {
      await scrollTo(page, '#entriesWrap');
      await highlightElement(page, '#btnViewCard', 2000);
      await page.waitForTimeout(500);
      await highlightElement(page, '#btnViewTable', 2000);
      // Switch to table view
      const tableBtn = page.locator('#btnViewTable');
      if (await tableBtn.isVisible().catch(() => false)) {
        await tableBtn.click();
        await page.waitForTimeout(1000);
      }
      await highlightElement(page, '#entriesWrap', 2000);
      // Switch back to card view
      const cardBtn = page.locator('#btnViewCard');
      if (await cardBtn.isVisible().catch(() => false)) {
        await cardBtn.click();
        await page.waitForTimeout(800);
      }
    },
  },

  // ─── 8. Edit Entry ───
  {
    name: 'edit-entry',
    narration:
      'To edit an existing entry, click the blue Edit button on any shift card. An inline form will appear where you can update the class name, times, hours, rate, or notes. Click Save when you\'re done.',
    action: async (page) => {
      await scrollTo(page, '#entriesWrap');
      const editBtn = page.locator('.lbtn.blue[data-edit], .lbtn[onclick*="editInline"]').first();
      if (await editBtn.isVisible().catch(() => false)) {
        await highlightElement(page, '.lbtn.blue[data-edit]', 2000);
        await editBtn.click();
        await page.waitForTimeout(1500);
        // Highlight the edit form area
        const editForm = page.locator('[id^="editForm_"]').first();
        if (await editForm.isVisible().catch(() => false)) {
          await page.waitForTimeout(1500);
          // Cancel out of it
          const cancelBtn = page.locator('.editCancelBtn, [onclick*="closeInline"]').first();
          if (await cancelBtn.isVisible().catch(() => false)) {
            await cancelBtn.click();
            await page.waitForTimeout(500);
          }
        }
      } else {
        // No entries to edit, just highlight the area
        await highlightElement(page, '#entriesWrap', 2000);
      }
    },
  },

  // ─── 9. Delete Entry ───
  {
    name: 'delete-entry',
    narration:
      'You can also delete an entry by clicking the red Delete button. You\'ll get a confirmation prompt before anything is removed, and an undo option appears briefly in case you change your mind.',
    action: async (page) => {
      const deleteBtn = page.locator('.lbtn.red[data-del], .lbtn[onclick*="deleteEntry"]').first();
      if (await deleteBtn.isVisible().catch(() => false)) {
        await highlightElement(page, '.lbtn.red[data-del]', 3000);
      } else {
        await highlightElement(page, '#entriesWrap', 2000);
      }
      await page.waitForTimeout(1000);
    },
  },

  // ─── 10. Reports Tab ───
  {
    name: 'reports',
    narration:
      'Switch to the Reports tab to see a summary of your earnings. You can select different pay periods and download a PDF report of your shifts and totals.',
    action: async (page) => {
      await goToTab(page, 'reports');
      await page.waitForTimeout(1500);
      await highlightElement(page, '#reportsPpSelect', 2000);
      await scrollTo(page, '#reportsWrap');
      await highlightElement(page, '#reportsWrap', 2000);
      await page.waitForTimeout(1000);
    },
  },

  // ─── 11. Profile ───
  {
    name: 'profile',
    narration:
      'In the Profile tab, you can change your theme. We have Light, Dark, and Boutique themes available. You can also update your email, username, and PIN. Below that you\'ll find email notification preferences and your Google Calendar connection.',
    action: async (page) => {
      await goToTab(page, 'profile');
      await page.waitForTimeout(1500);

      // Show themes
      await highlightElement(page, '#themeBtn_light', 1500);
      await page.waitForTimeout(300);

      // Switch to dark
      const darkBtn = page.locator('#themeBtn_dark');
      if (await darkBtn.isVisible().catch(() => false)) {
        await darkBtn.click();
        await page.waitForTimeout(1500);
      }

      // Switch to boutique
      const boutiqueBtn = page.locator('#themeBtn_boutique');
      if (await boutiqueBtn.isVisible().catch(() => false)) {
        await boutiqueBtn.click();
        await page.waitForTimeout(1500);
      }

      // Back to light
      const lightBtn = page.locator('#themeBtn_light');
      if (await lightBtn.isVisible().catch(() => false)) {
        await lightBtn.click();
        await page.waitForTimeout(1000);
      }

      // Show account fields
      await scrollTo(page, '#newEmail');
      await highlightElement(page, '#newEmail', 1500);
      await highlightElement(page, '#newPin', 1500);
    },
  },

  // ─── 12. Google Calendar ───
  {
    name: 'google-calendar',
    narration:
      'The Google Calendar card lets you connect your Google account to automatically import shifts from your calendar. Once connected, matching events are pulled in based on your assigned locations.',
    action: async (page) => {
      await scrollTo(page, '#gcalCard');
      await highlightElement(page, '#gcalCard', 3000);
      await page.waitForTimeout(1000);
    },
  },

  // ─── 13. Pay History ───
  {
    name: 'pay-history',
    narration:
      'The My Pay History section lets you view your earnings over any date range. Set the start and end dates, then click Summary for a quick overview or Detail for a shift by shift breakdown.',
    action: async (page) => {
      await scrollTo(page, '#myPayHistoryCard');
      await highlightElement(page, '#myPayHistoryCard', 3000);
      await page.waitForTimeout(800);
      await highlightElement(page, '#earningsFrom', 1500);
      await highlightElement(page, '#earningsTo', 1500);
      await highlightElement(page, '#eBtnSummary', 1500);
      await highlightElement(page, '#eBtnDetail', 1500);
    },
  },

  // ─── 14. Support ───
  {
    name: 'support',
    narration:
      'The Support tab has frequently asked questions, a form to report bugs, and an AI assistant that can answer questions about the app instantly.',
    action: async (page) => {
      await goToTab(page, 'support');
      await page.waitForTimeout(1500);
      await scrollTo(page, '#aiChatInput');
      await highlightElement(page, '#aiChatInput', 2000);
      await page.waitForTimeout(1000);
    },
  },

  // ─── 15. Outro ───
  {
    name: 'outro',
    narration:
      'That\'s everything you need to know! If you have any questions, use the Support tab or reach out to your manager. Thanks for watching.',
    action: async (page) => {
      await goToTab(page, 'home');
      await page.waitForTimeout(2000);
    },
  },
];

module.exports = scenes;

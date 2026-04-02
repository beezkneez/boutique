/**
 * Admin/Moderator demo video scenes.
 * Each scene has a name, narration text, and a Playwright action function.
 */

const {
  highlightElement,
  typeSlowly,
  goToTab,
  goToAdminTab,
  scrollTo,
  waitForNarration,
} = require('./demo-helpers');

const APP_URL = 'https://teststudio.demo';
const ADMIN_USER = 'admin';
const ADMIN_PIN = '1212';

/** @type {Array<{name:string, narration:string, action:(page:import('playwright').Page)=>Promise<void>}>} */
const scenes = [
  // ─── 1. Intro ───
  {
    name: 'intro',
    narration:
      'This guide covers the admin and moderator features of Test Studio. We\'ll walk through every tool available for managing your team.',
    action: async (page) => {
      await page.goto(APP_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    },
  },

  // ─── 2. Admin Login ───
  {
    name: 'admin-login',
    narration:
      'Log in with your admin username and PIN. Admin and moderator accounts have additional tabs that regular staff don\'t see.',
    action: async (page) => {
      await highlightElement(page, '#loginEmail');
      await typeSlowly(page, '#loginEmail', ADMIN_USER);
      await page.waitForTimeout(400);
      await highlightElement(page, '#loginPin');
      await typeSlowly(page, '#loginPin', ADMIN_PIN, 120);
      await page.waitForTimeout(400);
      await highlightElement(page, '#btnLogin');
      await page.waitForTimeout(600);
      await page.click('#btnLogin');
      await page.waitForTimeout(3000);
      // Highlight the admin tab in nav
      await highlightElement(page, '#deskAdmin', 2000);
    },
  },

  // ─── 3. Payroll Tab ───
  {
    name: 'payroll',
    narration:
      'The Payroll section shows all staff entries for the current pay period. You can see each employee\'s submitted shifts, total hours, and pay. Late submissions are flagged with a badge so you know who hasn\'t submitted yet.',
    action: async (page) => {
      await goToTab(page, 'admin');
      await page.waitForTimeout(1500);
      await goToAdminTab(page, 'payroll');
      await page.waitForTimeout(1000);
      await highlightElement(page, '#adminUsersCard', 3000);
      await scrollTo(page, '#adminUsersCard');
      await page.waitForTimeout(1000);
      // Show late card if visible
      const lateCard = page.locator('#payrollLateCard');
      if (await lateCard.isVisible().catch(() => false)) {
        await highlightElement(page, '#payrollLateCard', 2000);
      }
    },
  },

  // ─── 4. Send Payroll Report ───
  {
    name: 'send-payroll',
    narration:
      'When you\'re ready, click the Send Payroll Report button. This compiles all entries into a report and emails it to the configured accountant and admin addresses. You can also send reminder emails to staff who haven\'t submitted.',
    action: async (page) => {
      await scrollTo(page, '#btnSendReport');
      await highlightElement(page, '#btnSendReport', 3000);
      await page.waitForTimeout(1500);
    },
  },

  // ─── 5. Staff Management ───
  {
    name: 'staff-management',
    narration:
      'The Staff tab lets you manage all team members. You can search by name, sort the list, and view detailed profiles. To add a new member, fill in their name, email, username, PIN, and role. Roles include Employee, Contractor, and Moderator.',
    action: async (page) => {
      await goToAdminTab(page, 'staff');
      await page.waitForTimeout(1500);

      // Show the search and sort
      await highlightElement(page, '#staffSearchInput', 2000);
      await highlightElement(page, '#staffSortSelect', 2000);

      // Scroll to add staff form
      await scrollTo(page, '#newStaffName');
      await highlightElement(page, '#newStaffName', 1500);
      await highlightElement(page, '#newStaffEmail', 1500);
      await highlightElement(page, '#newStaffType', 1500);
      await page.waitForTimeout(500);

      // Show the staff list
      await scrollTo(page, '#staffListWrap');
      await highlightElement(page, '#staffListWrap', 2000);
    },
  },

  // ─── 6. Locations ───
  {
    name: 'locations',
    narration:
      'In the Settings area, you\'ll find location management. Each location has a name and address. The address field is used for Google Calendar matching, so shifts at recognized addresses are automatically imported for the right location.',
    action: async (page) => {
      await goToAdminTab(page, 'settings');
      await page.waitForTimeout(1500);
      // Locations are typically in settings
      // Scroll to find location-related elements
      const locCard = page.locator('#locationsCard, [id*="location"], .locations-section').first();
      if (await locCard.isVisible().catch(() => false)) {
        await scrollTo(page, '#locationsCard');
        await highlightElement(page, '#locationsCard', 3000);
      }
      await page.waitForTimeout(1000);
    },
  },

  // ─── 7. Settings ───
  {
    name: 'settings',
    narration:
      'The Settings tab contains pay period configuration, email recipients for payroll reports, and bonus thresholds. You can set the accountant email, admin notification emails, and configure automatic report schedules.',
    action: async (page) => {
      await goToAdminTab(page, 'settings');
      await page.waitForTimeout(1000);
      await scrollTo(page, '#adminAccountantEmail');
      await highlightElement(page, '#adminAccountantEmail', 2000);
      await highlightElement(page, '#adminEmail1', 1500);
      await page.waitForTimeout(1000);
    },
  },

  // ─── 8. Mass Messaging ───
  {
    name: 'mass-messaging',
    narration:
      'The mass messaging feature allows you to send notifications to all staff at once. Compose your message, select the recipients, and send. This is useful for announcements, schedule changes, or reminders.',
    action: async (page) => {
      // Mass messaging may be in payroll or a separate section
      const msgCard = page.locator('#massMessageCard, [id*="massMsg"], [id*="broadcast"]').first();
      if (await msgCard.isVisible().catch(() => false)) {
        await scrollTo(page, '#massMessageCard');
        await highlightElement(page, '#massMessageCard', 3000);
      }
      await page.waitForTimeout(1500);
    },
  },

  // ─── 9. Export ───
  {
    name: 'export',
    narration:
      'The Export tab provides options to download payroll data as CSV or PDF. You can export the current pay period or select a custom date range. These files are ready to import into your accounting software.',
    action: async (page) => {
      await goToAdminTab(page, 'export');
      await page.waitForTimeout(1500);
      const exportCard = page.locator('#adminTab_export, [id*="export"]').first();
      if (await exportCard.isVisible().catch(() => false)) {
        await highlightElement(page, '#adminTab_export', 3000);
      }
      await page.waitForTimeout(1000);
    },
  },

  // ─── 10. Flagged Entries ───
  {
    name: 'flagged-entries',
    narration:
      'The Flagged Entries section shows submissions that need review. Entries can be flagged for unusual hours, rate discrepancies, or manual overrides. You can review each one, add notes, and resolve or reject them.',
    action: async (page) => {
      await goToAdminTab(page, 'flagged');
      await page.waitForTimeout(1500);
      const flaggedCard = page.locator('#adminTab_flagged, [id*="flagged"]').first();
      if (await flaggedCard.isVisible().catch(() => false)) {
        await highlightElement(page, '#adminTab_flagged', 3000);
      }
      await page.waitForTimeout(1000);
    },
  },

  // ─── 11. Moderator Home ───
  {
    name: 'moderator-home',
    narration:
      'Admin and moderator accounts also have access to the regular Home tab. This means you can log your own shifts just like any other staff member, in addition to your management duties.',
    action: async (page) => {
      await goToTab(page, 'home');
      await page.waitForTimeout(1500);
      await highlightElement(page, '#logClassCard', 3000);
      await scrollTo(page, '#logClassCard');
      await page.waitForTimeout(1000);
    },
  },

  // ─── 12. Outro ───
  {
    name: 'outro',
    narration:
      'You\'re all set to manage your team with Test Studio. If you need help, check the Support tab or contact the developer. Thanks for watching!',
    action: async (page) => {
      await goToTab(page, 'home');
      await page.waitForTimeout(2000);
    },
  },
];

module.exports = scenes;

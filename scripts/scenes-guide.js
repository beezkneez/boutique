/**
 * Comprehensive User Guide video scenes.
 * Matches the full /guide.html walkthrough.
 *
 * Flow:
 *   1. Login (light mode)
 *   2. Go to Profile — show all profile features, then switch to Dark mode
 *   3. Go back to Home — walk through everything else in Dark mode
 *
 * Usage:  node scripts/generate-demo.js guide
 */

const {
  highlightElement,
  typeSlowly,
  goToTab,
  scrollTo,
} = require('./demo-helpers');

const APP_URL = 'https://teststudio.demo';
const STAFF_EMAIL = 'judbeasley@gmail.com';
const STAFF_PIN = '1212';

/** @type {Array<{name:string, narration:string, action:(page:import('playwright').Page)=>Promise<void>}>} */
const scenes = [

  // ═══════════════════════════════════════════
  //  INTRO & LOGIN (Light mode)
  // ═══════════════════════════════════════════

  {
    name: '01-intro',
    narration:
      'Welcome to the complete Test Studio user guide. This video walks through every feature of the app so you\'ll be fully up to speed. Let\'s get started.',
    action: async (page) => {
      await page.goto(APP_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
    },
  },

  {
    name: '02-login',
    narration:
      'To log in, enter your email address or username and your PIN, then tap Log In. If you\'ve forgotten your PIN, tap Forgot PIN and it will be emailed to you.',
    action: async (page) => {
      await highlightElement(page, '#loginEmail', 2000);
      await typeSlowly(page, '#loginEmail', STAFF_EMAIL);
      await page.waitForTimeout(400);
      await highlightElement(page, '#loginPin', 2000);
      await typeSlowly(page, '#loginPin', STAFF_PIN, 120);
      await page.waitForTimeout(400);
      await highlightElement(page, '#btnLogin', 1500);
      await page.waitForTimeout(600);
      await page.click('#btnLogin');
      await page.waitForTimeout(3000);
      // Ensure light theme for profile section
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        try { localStorage.setItem('app_theme', 'light'); } catch (_) {}
      });
      await page.waitForTimeout(500);
    },
  },

  // ═══════════════════════════════════════════
  //  PROFILE (Light mode — shown first)
  // ═══════════════════════════════════════════

  {
    name: '03-profile-intro',
    narration:
      'Before we explore the main features, let\'s set up your profile. Head to the Profile tab. This is your personal settings hub where you can customize everything about your account.',
    action: async (page) => {
      await goToTab(page, 'profile');
      await page.waitForTimeout(2000);
    },
  },

  {
    name: '04-profile-photo',
    narration:
      'At the top is your profile photo. Tap the pencil icon on the avatar to upload a picture. It shows in the top bar whenever you\'re logged in. Below that you can change your email address, set a username for quicker login, and update your PIN.',
    action: async (page) => {
      const avatar = page.locator('.avatar-wrap, [id*="avatar"], [id*="profilePic"]').first();
      if (await avatar.isVisible().catch(() => false)) {
        await highlightElement(page, '.avatar-wrap', 2500);
      }
      await page.waitForTimeout(1000);
      await scrollTo(page, '#newEmail');
      await highlightElement(page, '#newEmail', 1500);
      await page.waitForTimeout(500);
      await highlightElement(page, '#newPin', 1500);
      await page.waitForTimeout(800);
    },
  },

  {
    name: '05-profile-preferences',
    narration:
      'In the Preferences section, you can choose to receive pay summary emails when payroll is processed, with optional PDF and CSV attachments. You can also toggle notifications for bug report updates.',
    action: async (page) => {
      const emailToggle = page.locator('#toggleEmailReports, [id*="emailReport"]').first();
      if (await emailToggle.isVisible().catch(() => false)) {
        await scrollTo(page, '#toggleEmailReports');
        await highlightElement(page, '#toggleEmailReports', 2500);
      }
      await page.waitForTimeout(2000);
    },
  },

  {
    name: '06-profile-google',
    narration:
      'Scroll down to the Google Calendar card. Tap Connect to authorize the app with your Google account. Google may show an "unsafe" warning since our app hasn\'t gone through their full review, but Test Studio only requests read-only access to event names, times, and locations. Once connected, select your Default Calendar from the dropdown so imports are automatic.',
    action: async (page) => {
      await scrollTo(page, '#gcalCard');
      await highlightElement(page, '#gcalCard', 4000);
      await page.waitForTimeout(2500);
    },
  },

  {
    name: '07-profile-contractor',
    narration:
      'If you\'re set up as a contractor, you\'ll see fields for your GST number and a Charge GST toggle. When enabled, 5 percent GST is automatically added to all your pay in reports and statements.',
    action: async (page) => {
      const gstField = page.locator('#gstNumber, [id*="gst"]').first();
      if (await gstField.isVisible().catch(() => false)) {
        await scrollTo(page, '#gstNumber');
        await highlightElement(page, '#gstNumber', 3000);
      }
      await page.waitForTimeout(2000);
    },
  },

  {
    name: '08-profile-pay-history',
    narration:
      'My Pay History lets you view all your earnings over any date range. Set start and end dates and tap Load. You\'ll see total hours, gross pay, and GST if applicable. Toggle between Summary view, which groups by period, and Shifts view, which shows every individual entry. The Print PDF button exports an earnings statement.',
    action: async (page) => {
      await scrollTo(page, '#myPayHistoryCard');
      await highlightElement(page, '#myPayHistoryCard', 3000);
      await page.waitForTimeout(1000);
      await highlightElement(page, '#earningsFrom', 1500);
      await highlightElement(page, '#earningsTo', 1500);
      await page.waitForTimeout(600);
      await highlightElement(page, '#eBtnSummary', 1500);
      await highlightElement(page, '#eBtnDetail', 1500);
      await page.waitForTimeout(1000);
    },
  },

  // ─── THEME SWITCH ───

  {
    name: '09-themes',
    narration:
      'Now let\'s pick a theme. The app comes with three options. We\'re currently in Light mode with a clean white background. Let\'s try Dark mode. The entire app transforms to a dark background with light text, great for low-light use. There\'s also an Boutique theme with deep burgundy brand colors. We\'ll stick with Dark mode for the rest of this guide.',
    action: async (page) => {
      // Scroll to theme buttons
      const lightBtn = page.locator('#themeBtn_light');
      if (await lightBtn.isVisible().catch(() => false)) {
        await scrollTo(page, '#themeBtn_light');
        await highlightElement(page, '#themeBtn_light', 2000);
        await page.waitForTimeout(1500);
      }

      // Switch to dark
      const darkBtn = page.locator('#themeBtn_dark');
      if (await darkBtn.isVisible().catch(() => false)) {
        await highlightElement(page, '#themeBtn_dark', 1500);
        await darkBtn.click();
        await page.waitForTimeout(2500);
      }

      // Flash boutique
      const boutiqueBtn = page.locator('#themeBtn_boutique');
      if (await boutiqueBtn.isVisible().catch(() => false)) {
        await boutiqueBtn.click();
        await page.waitForTimeout(2000);
      }

      // Back to dark for the rest
      if (await darkBtn.isVisible().catch(() => false)) {
        await darkBtn.click();
        await page.waitForTimeout(1500);
      }
    },
  },

  // ═══════════════════════════════════════════
  //  HOME PAGE (Dark mode from here on)
  // ═══════════════════════════════════════════

  {
    name: '10-home-overview',
    narration:
      'Now let\'s head back to the Home page, where you\'ll spend most of your time. At the very top is the pay period bar. This dark strip shows which period you\'re viewing, along with your total shifts, hours worked, and estimated gross pay.',
    action: async (page) => {
      await goToTab(page, 'home');
      await page.waitForTimeout(1500);
      await highlightElement(page, '.ph-strip', 3000);
      await page.waitForTimeout(1500);
      await highlightElement(page, '.ph-stats', 3000);
      await page.waitForTimeout(1000);
    },
  },

  {
    name: '11-pay-period-selector',
    narration:
      'The dropdown lets you switch between pay periods. Use the arrow buttons to step forward or backward. A green border means the current period, blue means future, and no border means past. Your admin configures the pay schedule, which can be biweekly, weekly, semi-monthly, or monthly.',
    action: async (page) => {
      await highlightElement(page, '#payPeriodSelect', 2500);
      await page.waitForTimeout(1500);
      const nextBtn = page.locator('.ph-strip button[onclick*="ppNav_"]').last();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
        const prevBtn = page.locator('.ph-strip button[onclick*="ppNav_"]').first();
        if (await prevBtn.isVisible().catch(() => false)) {
          await prevBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    },
  },

  // ═══════════════════════════════════════════
  //  CALENDAR WIDGET (Dark)
  // ═══════════════════════════════════════════

  {
    name: '12-calendar-period',
    narration:
      'Below the pay period bar is the calendar widget. By default it shows Pay Period View, displaying only the days in your current period. Days with entries have a tinted background and a small count badge. Today is outlined with a red border.',
    action: async (page) => {
      await scrollTo(page, '#calendarGrid');
      await highlightElement(page, '#calendarGrid', 4000);
      await page.waitForTimeout(2000);
    },
  },

  {
    name: '13-calendar-month',
    narration:
      'Tap Month View to see a full calendar month. Navigate between months with the arrow buttons. Tap any day with entries to jump straight to those shifts. Tap an empty day to set the date for logging. The calendar stays in sync with the pay period dropdown, so switching one updates the other.',
    action: async (page) => {
      const toggleBtn = page.locator('#calViewToggle');
      if (await toggleBtn.isVisible().catch(() => false)) {
        await highlightElement(page, '#calViewToggle', 1500);
        await toggleBtn.click();
        await page.waitForTimeout(1500);
        await highlightElement(page, '#calendarGrid', 3000);
        await page.waitForTimeout(1200);
        const nextNav = page.locator('.cal-nav-btn').last();
        if (await nextNav.isVisible().catch(() => false)) {
          await nextNav.click();
          await page.waitForTimeout(1000);
          const prevNav = page.locator('.cal-nav-btn').first();
          if (await prevNav.isVisible().catch(() => false)) {
            await prevNav.click();
            await page.waitForTimeout(800);
          }
        }
        await toggleBtn.click();
        await page.waitForTimeout(800);
      }
    },
  },

  // ═══════════════════════════════════════════
  //  LOGGING A CLASS (Dark)
  // ═══════════════════════════════════════════

  {
    name: '14-log-class-form',
    narration:
      'Now let\'s log a class. Scroll to the Log a Class card. Pick a date, which defaults to today, then choose a location from the dropdown. Optionally add notes for your admin.',
    action: async (page) => {
      await scrollTo(page, '#logClassCard');
      await highlightElement(page, '#logClassCard', 2000);
      await page.waitForTimeout(800);
      // Wait for date field to be visible after page load
      await page.waitForSelector('#date', { state: 'visible', timeout: 5000 }).catch(() => {});
      await highlightElement(page, '#date', 2000);
      const today = new Date().toISOString().split('T')[0];
      await page.evaluate((d) => { document.getElementById('date').value = d; }, today);
      await page.waitForTimeout(600);
      await highlightElement(page, '#location', 2000);
      const options = await page.$$eval('#location option', opts =>
        opts.filter(o => o.value).map(o => o.value)
      );
      if (options.length > 0) {
        await page.selectOption('#location', options[0]);
      }
      await page.waitForTimeout(600);
    },
  },

  {
    name: '15-log-class-shift',
    narration:
      'Tap Add Shift to create a shift row. Fill in the class name, like Pole 1 or Aerial Silks. Set start and end times with the time picker. Enter hours and hourly rate. The total calculates automatically. If it\'s a pole class with 11 or more students, check the Pole Bonus box for an extra 5 dollar bonus.',
    action: async (page) => {
      const addBtn = page.locator('#hadd-btn').first();
      if (await addBtn.isVisible().catch(() => false)) {
        await highlightElement(page, '#hadd-btn', 1500);
        await addBtn.click();
        await page.waitForTimeout(1000);
      }
      await highlightElement(page, '#lines', 3000);
      await scrollTo(page, '#lines');
      await page.waitForTimeout(1000);
      await scrollTo(page, '#subtotalValue');
      await highlightElement(page, '#subtotalValue', 2000);
      await page.waitForTimeout(800);
    },
  },

  {
    name: '16-multiple-shifts',
    narration:
      'Taught multiple classes? Tap Add Shift again for another row. Each shift has its own class name, times, and rate. They all share the same date and location. The subtotal shows the combined total. Remove any extra rows with the X button.',
    action: async (page) => {
      const addBtn = page.locator('#hadd-btn').first();
      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(800);
      }
      await highlightElement(page, '#lines', 3000);
      await page.waitForTimeout(1500);
      const removeBtn = page.locator('.line-card .lbtn.red, [onclick*="removeLine"]').last();
      if (await removeBtn.isVisible().catch(() => false)) {
        await removeBtn.click();
        await page.waitForTimeout(600);
      }
    },
  },

  {
    name: '17-submit',
    narration:
      'When everything looks good, tap Submit. Your entries are saved instantly and appear in the This Pay Period section below. The summary bar at the top updates with the new totals.',
    action: async (page) => {
      await scrollTo(page, '#btnSubmit');
      await highlightElement(page, '#btnSubmit', 3000);
      await page.waitForTimeout(1500);
      await scrollTo(page, '#entriesWrap');
      await highlightElement(page, '#entriesWrap', 2000);
      await page.waitForTimeout(1000);
    },
  },

  // ═══════════════════════════════════════════
  //  COMMISSIONS (Dark)
  // ═══════════════════════════════════════════

  {
    name: '18-commissions',
    narration:
      'Commissions are logged separately. Scroll to the Log Commission card. Enter the dollar amount, pick a date, and add an optional note like retail sales or private lesson tip. Tap Add Commission. They show up with a money bag icon and are counted separately in your pay summary.',
    action: async (page) => {
      await scrollTo(page, '#commissionCard');
      await highlightElement(page, '#commissionCard', 3000);
      await page.waitForTimeout(1000);
      await highlightElement(page, '#commissionAmt', 1500);
      await highlightElement(page, '#commissionDate', 1500);
      await highlightElement(page, '#btnCommission', 2000);
      await page.waitForTimeout(800);
    },
  },

  // ═══════════════════════════════════════════
  //  EDITING & DELETING (Dark)
  // ═══════════════════════════════════════════

  {
    name: '19-edit-entry',
    narration:
      'To edit an entry, find it in the This Pay Period section and tap the blue Edit button. An inline form appears where you can change the date, class name, location, times, hours, rate, and notes. If you change the date to a different pay period, the entry automatically moves there.',
    action: async (page) => {
      await scrollTo(page, '#entriesWrap');
      const editBtn = page.locator('[data-edit]').first();
      if (await editBtn.isVisible().catch(() => false)) {
        await highlightElement(page, '[data-edit]', 2000);
        await editBtn.click();
        await page.waitForTimeout(2000);
        const editForm = page.locator('.edit-form').first();
        if (await editForm.isVisible().catch(() => false)) {
          await page.waitForTimeout(2000);
          const cancelBtn = page.locator('.editCancelBtn').first();
          if (await cancelBtn.isVisible().catch(() => false)) {
            await cancelBtn.click();
            await page.waitForTimeout(500);
          }
        }
      }
    },
  },

  {
    name: '20-delete-entry',
    narration:
      'To delete, tap the red Delete button. An Undo toast appears at the bottom for about 6 seconds in case you change your mind. You can also delete all entries for a day at once using the Delete Day button in the day header.',
    action: async (page) => {
      const delBtn = page.locator('[data-del]').first();
      if (await delBtn.isVisible().catch(() => false)) {
        await highlightElement(page, '[data-del]', 3000);
      }
      await page.waitForTimeout(1000);
      const delDayBtn = page.locator('[data-day]').first();
      if (await delDayBtn.isVisible().catch(() => false)) {
        await highlightElement(page, '[data-day]', 2000);
      }
      await page.waitForTimeout(1000);
    },
  },

  // ═══════════════════════════════════════════
  //  BONUSES (Dark)
  // ═══════════════════════════════════════════

  {
    name: '21-weekly-bonus',
    narration:
      'Now, bonuses. The weekly shift bonus kicks in when you teach 6 or more hours in a single Monday through Sunday week. A 5 dollar per hour bonus is applied retroactively to all your hours that week. A progress bar shows how close you are to the threshold.',
    action: async (page) => {
      await scrollTo(page, '#logClassCard');
      const bonusTracker = page.locator('#weeklyBonusTracker, [id*="bonus"]').first();
      if (await bonusTracker.isVisible().catch(() => false)) {
        await highlightElement(page, '#weeklyBonusTracker', 4000);
      }
      await page.waitForTimeout(2000);
    },
  },

  {
    name: '22-pole-bonus',
    narration:
      'The Pole 11 plus bonus is a flat 5 dollar bonus per class. Check the Pole Bonus checkbox when logging a pole class with 11 or more students. Some class types like Admin may be excluded from the weekly bonus threshold, but they\'re still paid normally.',
    action: async (page) => {
      await scrollTo(page, '#lines');
      await highlightElement(page, '#lines', 3000);
      await page.waitForTimeout(2000);
    },
  },

  // ═══════════════════════════════════════════
  //  LATE SUBMISSIONS (Dark)
  // ═══════════════════════════════════════════

  {
    name: '23-late-submissions',
    narration:
      'A late entry is any shift logged after its pay period has ended. Late entries are highlighted with a yellow background and a Late tag. They\'re automatically queued as pending submissions for admin review and included in the next payroll. If you edit a late entry and move its date into the current period, the late tag is removed.',
    action: async (page) => {
      await scrollTo(page, '.ph-strip');
      const prevBtn = page.locator('.ph-strip button[onclick*="ppNav_"]').first();
      if (await prevBtn.isVisible().catch(() => false)) {
        await prevBtn.click();
        await page.waitForTimeout(2000);
      }
      const lateEntry = page.locator('.late-entry, .late-tag').first();
      if (await lateEntry.isVisible().catch(() => false)) {
        await highlightElement(page, '.late-entry', 3000);
      }
      await page.waitForTimeout(1500);
      const nextBtn = page.locator('.ph-strip button[onclick*="ppNav_"]').last();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
    },
  },

  // ═══════════════════════════════════════════
  //  FLAG SYSTEM (Dark)
  // ═══════════════════════════════════════════

  {
    name: '24-flags',
    narration:
      'The flag system is how your admin marks entries that need attention, like incorrect hours or a wrong rate. If you\'re flagged, an orange banner appears on your Home page. Tap it to see the details. You can respond with an explanation and optionally submit corrected values. Flags have three statuses: flagged, corrected, and resolved.',
    action: async (page) => {
      await goToTab(page, 'home');
      await page.waitForTimeout(1000);
      const flagBanner = page.locator('#flagBanner, [id*="flag"]').first();
      if (await flagBanner.isVisible().catch(() => false)) {
        await highlightElement(page, '#flagBanner', 3000);
      }
      await page.waitForTimeout(2500);
    },
  },

  // ═══════════════════════════════════════════
  //  GOOGLE CALENDAR IMPORT (Dark)
  // ═══════════════════════════════════════════

  {
    name: '25-google-import',
    narration:
      'If you\'ve connected Google Calendar from the Profile tab, you can import shifts directly. Tap the Import button in the calendar widget header. Your events appear in a list. Toggle on the ones you want, set a bulk rate or per-event rate, and tap Import. The system auto-matches locations and detects duplicates.',
    action: async (page) => {
      await scrollTo(page, '#calendarGrid');
      const importBtn = page.locator('#gcalImportPeriodBtn').first();
      if (await importBtn.isVisible().catch(() => false)) {
        await highlightElement(page, '#gcalImportPeriodBtn', 3000);
      }
      await page.waitForTimeout(2500);
    },
  },

  // ═══════════════════════════════════════════
  //  REPORTS (Dark)
  // ═══════════════════════════════════════════

  {
    name: '26-reports-overview',
    narration:
      'Switch to the Reports tab for a professional breakdown of your pay. The dropdown at the top lets you select any pay period.',
    action: async (page) => {
      await goToTab(page, 'reports');
      await page.waitForTimeout(2000);
      await highlightElement(page, '#reportsPpSelect', 2500);
      await page.waitForTimeout(1000);
    },
  },

  {
    name: '27-reports-breakdown',
    narration:
      'You\'ll see a daily breakdown of your shifts, with location, time, hours, rate, and pay for each. Below that are weekly bonus details, a commissions section, and a grand total. Late entries show the yellow Late tag here too.',
    action: async (page) => {
      await scrollTo(page, '#reportsWrap');
      await highlightElement(page, '#reportsWrap', 4000);
      await page.waitForTimeout(2000);
      await page.evaluate(() => {
        const wrap = document.getElementById('reportsWrap');
        if (wrap) wrap.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(2000);
    },
  },

  {
    name: '28-reports-export',
    narration:
      'Tap Export PDF to download a formatted, printable statement. You can also get reports emailed to you with PDF and CSV attachments by enabling them in your Profile preferences.',
    action: async (page) => {
      await scrollTo(page, '#reportsPpSelect');
      const exportBtn = page.locator('#btnDownloadPeriodRpt, [onclick*="downloadReport"]').first();
      if (await exportBtn.isVisible().catch(() => false)) {
        await highlightElement(page, '#btnDownloadPeriodRpt', 3000);
      }
      await page.waitForTimeout(2000);
    },
  },

  // ═══════════════════════════════════════════
  //  SUPPORT (Dark)
  // ═══════════════════════════════════════════

  {
    name: '29-support-guide',
    narration:
      'Head to the Support tab. At the top is a link to the full written User Guide, a detailed version of everything in this video. It\'s always available if you need to look something up.',
    action: async (page) => {
      await goToTab(page, 'support');
      await page.waitForTimeout(1500);
      await highlightElement(page, '#page_support .card:first-child', 3000);
      await page.waitForTimeout(1500);
    },
  },

  {
    name: '30-support-tools',
    narration:
      'Below the guide you\'ll find Report a Bug for anything broken, Message Support for general questions, and the Studio AI Assistant chatbot for instant answers about the app.',
    action: async (page) => {
      await scrollTo(page, '#bugDesc');
      await highlightElement(page, '#bugDesc', 2000);
      await page.waitForTimeout(600);
      await scrollTo(page, '#supportBody');
      await highlightElement(page, '#supportBody', 2000);
      await page.waitForTimeout(600);
      await scrollTo(page, '#aiChatInput');
      await highlightElement(page, '#aiChatInput', 2500);
      await page.waitForTimeout(1000);
    },
  },

  {
    name: '31-support-faq',
    narration:
      'At the bottom is a Frequently Asked Questions section with expandable answers covering the most common topics. Tap any question to see the answer.',
    action: async (page) => {
      await scrollTo(page, '#faqList');
      await highlightElement(page, '#faqList', 3000);
      await page.waitForTimeout(800);
      const firstFaq = page.locator('#faqList details').first();
      if (await firstFaq.isVisible().catch(() => false)) {
        const summary = firstFaq.locator('summary');
        await summary.click();
        await page.waitForTimeout(1500);
        await summary.click();
        await page.waitForTimeout(500);
      }
    },
  },

  // ═══════════════════════════════════════════
  //  INSTALL AS APP (Dark)
  // ═══════════════════════════════════════════

  {
    name: '32-install',
    narration:
      'You can add Test Studio to your phone\'s home screen for a full-screen app experience. On iPhone, open the site in Safari, tap Share, then Add to Home Screen. On Android, use Chrome and tap Add to Home Screen from the menu.',
    action: async (page) => {
      await goToTab(page, 'home');
      await page.waitForTimeout(2000);
      await page.waitForTimeout(2000);
    },
  },

  // ═══════════════════════════════════════════
  //  ADMIN FEATURES (Dark)
  // ═══════════════════════════════════════════

  {
    name: '33-admin-overview',
    narration:
      'If you\'re an admin, you\'ll see an additional Admin tab with powerful management tools for staff, payroll, pending submissions, flagged entries, and settings.',
    action: async (page) => {
      await goToTab(page, 'admin');
      await page.waitForTimeout(2000);
      await page.waitForTimeout(2000);
    },
  },

  {
    name: '34-admin-staff',
    narration:
      'The staff section lists all team members with their type and status. You can add new staff, edit members, or reset PINs from here.',
    action: async (page) => {
      await page.evaluate(() => {
        if (typeof showAdminTab === 'function') showAdminTab('staff');
      });
      await page.waitForTimeout(1500);
      await page.waitForTimeout(2000);
    },
  },

  {
    name: '35-admin-pending',
    narration:
      'The Pending tab shows late entries from staff, grouped by person and period. You can flag entries for correction, exclude them from payroll, or approve them.',
    action: async (page) => {
      await page.evaluate(() => {
        if (typeof showAdminTab === 'function') showAdminTab('pending');
      });
      await page.waitForTimeout(1500);
      await page.waitForTimeout(2000);
    },
  },

  {
    name: '36-admin-flags',
    narration:
      'The Flagged tab shows all flags across staff. Review responses and corrections, then approve or resolve each one.',
    action: async (page) => {
      await page.evaluate(() => {
        if (typeof showAdminTab === 'function') showAdminTab('flagged');
      });
      await page.waitForTimeout(1500);
      await page.waitForTimeout(2000);
    },
  },

  {
    name: '37-admin-settings',
    narration:
      'Admin Settings is where you configure report recipients, auto-send payroll timing, bonus thresholds and amounts, pay period frequency and dates, and manage work locations.',
    action: async (page) => {
      await page.evaluate(() => {
        if (typeof showAdminTab === 'function') showAdminTab('settings');
      });
      await page.waitForTimeout(1500);
      await scrollTo(page, '#settingsAdminOnly');
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        const el = document.getElementById('settingsAdminOnly');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
      await page.waitForTimeout(2000);
    },
  },

  // ═══════════════════════════════════════════
  //  TIPS & OUTRO (Dark)
  // ═══════════════════════════════════════════

  {
    name: '38-tips',
    narration:
      'A few quick tips. Log your hours right after each class, it only takes 30 seconds. Use Google Calendar import if your schedule is already there. Watch the weekly bonus tracker, one more class could unlock the bonus for the entire week. And set up email reports in Profile so you get a pay summary delivered to your inbox.',
    action: async (page) => {
      await goToTab(page, 'home');
      await page.waitForTimeout(1500);
      await scrollTo(page, '#calendarGrid');
      await page.waitForTimeout(2500);
    },
  },

  {
    name: '39-outro',
    narration:
      'That\'s everything! You now know how to log classes, add commissions, edit entries, track bonuses, import from Google Calendar, view reports, manage your profile, and get support. The written User Guide is always available on the Support tab. Thanks for watching, and happy logging!',
    action: async (page) => {
      await scrollTo(page, '.ph-strip');
      await page.waitForTimeout(2000);
      await highlightElement(page, '.ph-strip', 3000);
      await page.waitForTimeout(3000);
    },
  },
];

module.exports = scenes;

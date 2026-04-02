# CLAUDE.md

## Workflow

* **Off-hours (11 PM – 6 AM MST):** Auto-commit and push after the user approves a change. Do not wait to be asked.
* **During the day (6 AM – 11 PM MST):** Never auto-push. Always ask for explicit approval before committing and pushing. Offer two options:
  1. **Push now** — commit and push immediately (requires user approval)
  2. **Save locally, push at midnight** — commit locally and queue the push for midnight MST tonight. If the session is still open at midnight, auto-push all queued commits.
* website information https://teststudio.demo   regular user is username demo pin 1212  admin username is admin pin 1212
* This is the boutique fitness demo/sales model — soft color palette, 20 test staff members

## UI Conventions

* **Always use toggles, never plain checkboxes.** Use the existing `admin-toggle` pattern: `<label class="admin-toggle"><input type="checkbox"><span class="slider"></span></label>` wrapped in a `toggle-row` div.

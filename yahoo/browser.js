const path = require('node:path');
const { chromium } = require('playwright');

const PROFILE_DIR = path.join(__dirname, '.playwright-profile');

async function launchContext({ headless = true } = {}) {
  return chromium.launchPersistentContext(PROFILE_DIR, {
    headless,
    viewport: { width: 1280, height: 900 },
  });
}

module.exports = { PROFILE_DIR, launchContext };

# MediCalc Pro — manual platform QA checklist

Run this checklist after each release on real devices. GitHub Actions verifies tests, TypeScript compilation and static build; it does not replace browser, iOS or Telegram testing.

## 1. Desktop browser

- [ ] Open https://whiterx.github.io/medcalc-pro-next/ in current Chrome or Edge.
- [ ] Search by calculator name, abbreviation and Russian clinical term (for example, `NEWS2`, `ТЭЛА`, `почки`).
- [ ] Open a calculator from search results and return to the catalog.
- [ ] Confirm the recently opened list contains calculator names only.
- [ ] Calculate a test result, then explicitly save it to History and/or Risk Basket.
- [ ] Return to the home page and confirm the saved summary is present after refresh.
- [ ] Confirm no entered input fields, patient name, date of birth or other identifier appears in saved entries.
- [ ] Use the clear controls and confirm History and Risk Basket clear independently.
- [ ] Open the laboratory converter and verify at least: creatinine 88.4 µmol/L = 1 mg/dL; glucose 5.5 mmol/L = 99 mg/dL; urea 10 mmol/L = 60 mg/dL; BUN 10 mmol/L = 28 mg/dL.
- [ ] Calculate a result and open Print Preview. Only the calculator title, result, warnings and reference should print; input forms and action controls should be hidden.

## 2. PWA installation and offline mode

- [ ] Visit the site online once so the service worker can install and cache the app shell.
- [ ] In Chrome/Edge, use the browser's Install app option. Confirm the MediCalc Pro name and icon.
- [ ] Launch the installed app and open at least two calculator routes directly.
- [ ] Disconnect the network and reload the app. Confirm the shell and previously cached calculator code still open.
- [ ] Reconnect and confirm the app updates to the latest deployment.
- [ ] On iPhone Safari, use Share → Add to Home Screen, then launch from the home-screen icon.
- [ ] Confirm the app opens without a 404 and that the home-screen icon/name look correct.

## 3. Telegram Mini App

- [ ] Set the bot's Menu Button URL to https://whiterx.github.io/medcalc-pro-next/ in BotFather (or the existing bot configuration).
- [ ] Open the app from the Telegram menu button on iOS and Android if available.
- [ ] Confirm the Mini App expands and uses the configured header/background colors.
- [ ] On the home page, confirm Telegram's BackButton is hidden.
- [ ] Open a calculator and confirm Telegram's BackButton appears.
- [ ] Press BackButton and confirm it returns to the MediCalc Pro home page, not out of the Mini App.
- [ ] Confirm normal vertical scrolling and Telegram's standard close/minimize gestures still work.

## 4. Privacy and limitations

- Saved calculation history and Risk Basket are opt-in: the user must press the corresponding save button.
- Only calculator name, displayed result summary, interpretation, route and timestamp are stored in this browser's local storage. Raw form values and patient identifiers are not intentionally saved.
- Recently opened history stores calculator routes only.
- Clearing History, Risk Basket and recently opened routes is available separately.
- This client-only application does not authenticate Telegram users or validate Telegram `initData` on a server. Do not treat the Mini App bridge as authentication, authorization or payment infrastructure.
- Do not enter identifiable patient information. Local browser storage is not an encrypted medical-record system.

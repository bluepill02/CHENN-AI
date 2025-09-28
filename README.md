
  # Chennai Community App (Copy)

  This is a code bundle for Chennai Community App (Copy). The original project is available at https://www.figma.com/design/cqqPzOHGePneGgC4XdHw4o/Chennai-Community-App--Copy-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ### Environment configuration

  The app automatically falls back to rich local simulations when backend services are not available.
  To connect Food Hunt to a live backend, set the following variables in your `.env` file:

  - `VITE_FOODHUNT_API_BASE_URL` – Base URL for the Food Hunt API (e.g. `https://api.example.com`).
  - `VITE_FOODHUNT_API_KEY` – Optional API key sent as `x-api-key` for authenticated requests.

  Leave these values unset to run entirely in simulation mode.

  ## Playwright E2E tests

  ### Bootstrapping

  The Playwright test runner is configured via `playwright.config.ts`. Tests use `PLAYWRIGHT_BASE_URL` (defaults to `http://localhost:3000`) so you can point them at any environment.

  ```powershell
  npm install
  npm run dev
  ```

  Leave the dev server running in another terminal, then execute any of the suites below. Use the shared npm script shortcuts when you want the default configuration:

  ```powershell
  npm run test:e2e
  ```

  To inspect tests in headed mode with trace/screenshot toggles, open the Playwright UI:

  ```powershell
  npm run test:e2e:ui
  ```

  The Live Alerts & Info experience now has Playwright coverage. Tests default to mocked network traffic so you can run them while the dev server is pointed at simulations.

  1. Start the dev server (`npm run dev`) so the UI and the `/test/push-alert` helper endpoint are available.
  2. Run the mocked scenarios:

  ```bash
  npx playwright test tests/e2e/alerts.spec.ts
  ```

  3. To exercise the real backend, export `LIVE_ALERTS=true` (or prefix the command) and run against the desired project, for example:

  ```bash
  LIVE_ALERTS=true npx playwright test --project=chromium tests/e2e/alerts.spec.ts
  ```

  When `LIVE_ALERTS` is enabled, the tests will skip the stubbed flows and execute a single smoke test against your dev API.

  ### Food Hunt Playwright coverage

  The Food Hunt experience now has end-to-end coverage mirroring the alerts suite.

  - **Mocked (default)** – routes vendor API calls through Playwright stubs and seeds the simulation cache:

    ```bash
    npx playwright test tests/e2e/foodhunt.spec.ts
    ```

  - **Backend retry/pagination/push flows** – export `FOODHUNT_FORCE_BACKEND=true` so the suite exercises the sequential network scenarios:

    ```bash
    FOODHUNT_FORCE_BACKEND=true npx playwright test tests/e2e/foodhunt.spec.ts
    ```

  - **Live backend smoke** – combine `LIVE_VENDORS=true` with an explicit `PLAYWRIGHT_BASE_URL` when targeting a real Food Hunt API:

    ```bash
    LIVE_VENDORS=true PLAYWRIGHT_BASE_URL=http://dev.example.com npx playwright test tests/e2e/foodhunt.spec.ts
    ```

  When `FOODHUNT_FORCE_BACKEND` is not set the suite still validates client-side filtering in simulation mode, while recording TODO annotations for the backend-only assertions. Firefox support is enabled via the shared Playwright config so all Food Hunt runs execute on Chromium, Firefox, and WebKit.

  ### Locality Ratings (Enga Area) Playwright coverage

  The Enga Area Locality Ratings flow now has comprehensive E2E coverage with the same mocked/live split used elsewhere.

  - **Mocked (default)** – stubs `/api/localities` and `/api/localities/:id` and seeds the locality simulation store with the JSON fixture from `tests/fixtures/localities.success.json`:

    ```bash
    npx playwright test tests/e2e/localities.spec.ts
    ```

  - **Live backend smoke** – export `LIVE_LOCALITIES=true` (optionally pair with `PLAYWRIGHT_BASE_URL`) to point at a running locality API and skip the mocked scenarios:

    ```bash
    LIVE_LOCALITIES=true PLAYWRIGHT_BASE_URL=http://dev.example.com npx playwright test tests/e2e/localities.spec.ts
    ```

  The suite documents expectations for `/api/localities?pincode=...&sort=...&page=...`, `/api/localities/:id`, and the optional `/test/push-locality` dev helper. When the UI is missing a requested behaviour (such as affordability sorting or keyboard affordances) the tests add TODO annotations instead of hard failing so they can accompany future feature work.

  ### Services Dashboard Playwright coverage

  The Local Services tab currently lives behind the bottom navigation instead of a dedicated `/services` route. The E2E suite navigates by launching the main app at `/` and clicking the “Services” button, so ensure the dev server renders `BottomNav` in the default experience.

  - **Mocked (default)** – intercepts `/api/services/all`, `/api/services/:id/contact`, and `/api/services/:id/book` using `tests/e2e/serviceDirectoryMocks.ts`. Scenarios cover backend-connected happy paths, category filtering, and booking confirmations:

    ```powershell
    npx playwright test tests/e2e/services-dashboard.spec.ts
    ```

  - **Custom data / live backend** – export `PLAYWRIGHT_BASE_URL` to point at a running backend or swap the mock data by extending `setupServiceDirectoryMocks` inside each test. When the backend is live you can unroute the mocks inside the spec to exercise the real API, but remember the UI will acknowledge fallback mode if the service fails.

  The helper in `tests/e2e/serviceDirectoryMocks.ts` exposes configurable delays, status codes, and payload overrides so you can experiment with degraded states. Reuse it in future specs to keep network assumptions consistent with the Jest/MSW fixtures.

  ### Community Dashboard Playwright coverage

  The Community Feed + Live Data experience now ships with mocked E2E flows as well. Launch the dev server (`npm run dev`) so the onboarding screens and API routes are available, then:

  - **Mocked (default)** – intercepts `/api/weather`, `/api/traffic`, `/api/public-services`, `/api/busByPincode`, and `/api/timetable`, seeds location context, and exercises quick actions, the post composer, comment drawer, and cross-browser snapshots:

    ```bash
    npx playwright test tests/e2e/community-dashboard.spec.ts
    ```

  - **Live backend smoke** – point to a running backend by exporting `LIVE_COMMUNITY=true` (optionally pair with `PLAYWRIGHT_BASE_URL`). The suite skips the mocked scenarios and validates that the dashboard renders without the stubs:

    ```bash
    LIVE_COMMUNITY=true PLAYWRIGHT_BASE_URL=http://dev.example.com npx playwright test tests/e2e/community-dashboard.spec.ts
    ```

  The mocked scenarios cover the hero snapshot, weather/traffic/service integrations, bilingual composer + comment CRUD, the live alerts drawer, quick action keyboard navigation, and Chromium/WebKit visual baselines. Requests made by the dashboard are recorded so query parameters (such as the active pincode) remain asserted.

  ## Services Dashboard Jest coverage

  The Services Directory (LocalServices) view now has a dedicated Jest + Testing Library suite that exercises both live-backend and simulation modes. The tests live at `components/__tests__/LocalServices.test.tsx` and are powered by MSW handlers (`tests/msw/serviceDirectoryHandlers.ts`) plus reusable fixtures (`tests/fixtures/serviceDirectoryFixtures.ts`).

  The suite validates:

  - Rendering of live data returned from `/api/services/all` including status messaging and analytics tiles.
  - Automatic fallback to the offline simulation cache whenever the backend is unavailable.
  - Interactive filtering via search/category controls, ensuring the UI reshapes the service list without errors.
  - Booking and contact flows, asserting that the UI posts to `/api/services/:id/book` & `/api/services/:id/contact` and surfaces confirmation toasts.

  Run the targeted tests with:

  ```bash
  npm test -- LocalServices
  ```

  > **Backend readiness note:** the MSW handlers intentionally mirror the API client contract. If new backend fields or endpoints are introduced, update the fixtures/handlers so the tests continue to reflect the live service responses. The suite already confirms that the UI communicates when it is connected to the real backend versus the simulation store, so any contract drift will quickly surface as a failing assertion.
  
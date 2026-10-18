# Friction Log

**Task attempted:** Deploy AEGIS-AI from GitHub to Render.

**Steps taken:** Connected the GitHub repository, selected the `main` branch, and configured Render to install dependencies, build the app, and start the service.

**Expected result:** Render would find the project files, build the app, and publish it.

**Actual result:** The first deployment failed because the configured root directory did not exist. After correcting that setting, the build failed because Vite could not find the frontend entry file referenced by `index.html`.

**Severity:** High — deployment was blocked until the project path and frontend entry point were corrected.

**Workaround used:** Corrected the Render root-directory setting and project entry-point setup. The live app subsequently became available.

**Actionable suggestion:** Render could check that the configured root directory and referenced frontend entry file exist, then show a clear error with the expected path and how to fix it.

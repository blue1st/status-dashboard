# AI SKILL for Status Dashboard

This document provides instructions and guidelines for AI coding assistants to maintain and extend the Status Dashboard project.

## Project Overview

The Status Dashboard is a static-site generator based system that monitors various services and displays their health on a modern web UI.
- **Config**: `config.yml` defines services and their checks.
- **Plugins**: Executable scripts in `plugins/` perform the actual status checks.
- **Generator**: `generate.js` runs the checks and updates `data/status.json`.
- **Frontend**: `index.html` displays the dashboard using Tailwind CSS and Lucide icons.

---

## Task: Managing Configuration (`config.yml`)

When asked to add or modify a service, update `config.yml` following this schema:

### Service Schema
```yaml
- id: unique-service-id          # Kebab-case, unique identifier
  name: Friendly Name            # Display name
  category: Web | Core | Backend # Logical grouping
  provider: aws | gcp | github   # Cloud provider (affects color/branding)
  icon: simpleicons-slug         # Icon slug from simpleicons.org (e.g., 'mysql', 'redis', 'docker')
  tags: ["Tag1", "Tag2"]         # Optional tags for filtering
  description: "Markdown text"   # Detailed description of the service
  recovery: "Markdown text"      # Steps to take if the service is down
  depends_on: ["other-id"]       # Optional list of service IDs this service depends on
  check:                         # Optional status check configuration
    plugin: plugin_name.sh       # Script file name in plugins/ directory
    args: ["arg1", "arg2"]       # Arguments passed to the plugin
```

### Icon Configuration

The dashboard uses [Simple Icons](https://simpleicons.org/) for service icons. To find a valid slug:
1.  Search for the brand on [simpleicons.org](https://simpleicons.org/).
2.  The slug is usually the lowercase name of the brand (e.g., `Amazon S3` -> `amazons3`, `Google Cloud` -> `googlecloud`).
3.  If a brand color is missing in `index.html`, it will default to a neutral gray.

**Special Mappings**:
The frontend automatically maps some common names to their official Simple Icons slugs:
- `aws` -> `amazonaws`
- `gcp` -> `googlecloud`
- `s3` -> `amazonaws`
- `spanner` -> `googlecloudspanner`
- `cloudrun` -> `googlecloud`

---

## Task: Developing Plugins (`plugins/`)

Plugins are executable scripts that return the status of a service.

### Interface Rules
1.  **Location**: Must be placed in the `plugins/` directory.
2.  **Permissions**: Must be executable (`chmod +x`).
3.  **Input**: Receives arguments as defined in `config.yml`.
4.  **Output**:
    -   `stdout`: Success or error messages (displayed in the dashboard).
    -   `stderr`: Error messages (displayed in the dashboard if stdout is empty).
5.  **Exit Codes**:
    -   `0`: **UP** (Service is healthy)
    -   `2`: **UNKNOWN / NONE** (Status cannot be determined or check is skipped)
    -   `Any other`: **DOWN** (Service is unhealthy)

### Example Bash Plugin (`plugins/http_check.sh`)
```bash
#!/bin/bash
URL=$1
if curl -s --head --request GET "$URL" | grep "200 OK" > /dev/null; then
  echo "Successfully connected to $URL"
  exit 0
else
  echo "Failed to connect to $URL"
  exit 1
fi
```

---

## Task: Adding a New Service

When a user asks to "monitor a new service", follow these steps:

1.  **Identify Check Method**: Determine if an existing plugin can be used or if a new one is needed.
2.  **Create Plugin (if needed)**:
    -   Write the script in `plugins/`.
    -   Make it executable using `chmod +x plugins/filename`.
    -   Test it manually.
3.  **Update `config.yml`**: Add the service entry with appropriate metadata and check configuration.
4.  **Regenerate Data**: Run `npm run generate` to verify the new service appears correctly.

---

## AI Rules & Constraints

-   **Uniqueness**: Always ensure `id` in `config.yml` is unique.
-   **Execution**: When creating a new plugin, you MUST run `chmod +x` on it if the environment allows, or instruct the user to do so.
-   **Pathing**: Plugins are always searched in the `plugins/` directory relative to the project root.
-   **Markdown Support**: Both `description` and `recovery` fields in `config.yml` support GitHub Flavored Markdown. Use it to provide clear, actionable information.
-   **Icon Validation**: Refer to the **Icon Configuration** section above for looking up slugs. If still unsure, prefer using a generic one like `server` or `cloud` rather than guessing.

---

## Maintenance Commands

-   **Install Dependencies**: `npm install`
-   **Run Status Check**: `npm run generate`
-   **Local Development Server**: `npm run dev`

Here's the updated `README.md` for the Bot Hatchery project, incorporating the changes and additions you've specified:

````markdown
# Bot Hatchery

Bot Hatchery is a project that manages multiple Telegram bots using the Grammy framework and Inversify for dependency injection. This project includes bots for NBU Rate and React Clicker.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [License](#license)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Phillbot/bot-farm.git
   cd bot-farm
   ```
````

2. Install dependencies:

   ```bash
   pnpm install
   ```

   > The repo is configured for `pnpm`. If the CLI isn't available yet, run `corepack enable pnpm` once.

3. Create a .env file in the root directory and fill in the necessary environment variables.

## Configuration

| Variable name                                     | Description                                       | Type                         |
| ------------------------------------------------- | ------------------------------------------------- | ---------------------------- |
| ENV                                               | Current environment                               | development \| production    |
| LOG_LEVEL                                         | Setup logger                                      | FULL \| COMPACT \| NONE      |
| PORT                                              | App port                                          | number                       |
| CONTACT_URL                                       | Any URL for server response in app start          | string                       |
| REQUEST_LIMIT_WINDOW_MS                           | Request limit window size in milliseconds         | number (default 60000)       |
| REQUEST_LIMIT_MAX                                 | Maximum requests per IP per window                | number (default 100)         |
| ENABLED_BOTS                                      | Comma-separated bot identifiers to enable (`nbu`, `react_clicker`). Defaults to `nbu`. | string          |
| NBU_RATE_EXCHANGE_BOT_TOKEN                       | Token for Nbu bot                                 | string                       |
| NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_CONNECT_URL | PostgreSQL connection URL                         | string                       |
| NBU_RATE_EXCHANGE_POSTGRESQL_DATABASE_PORT        | Optional override for the PostgreSQL port         | number (string)              |
| NBU_RATE_EXCHANGE_API_URL                         | API URL for exchange rates                        | string                       |
| NBU_RATE_EXCHANGE_WEB_LINK                        | Web link for NBU rate                             | string                       |
| NBU_RATE_EXCHANGE_API_BY_DATE_AND_CURR_URL        | API URL for exchange rates by date and currency   | string                       |
| NBU_RATE_EXCHANGE_CURRENCIES                      | Currencies for exchange rates, separated by comma | string (split by ,)          |
| NBU_RATE_EXCHANGE_CURRENCY_TABLE_CRON_SCHEMA      | Cron schema for daily currencies message          | \* \* \* \* \*               |
| NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA               | Cron schema for chart updates                     | \* \* \* \* \*               |
| NBU_RATE_EXCHANGE_CRON_TIMEZONE                   | Timezone for cron jobs                            | string                       |
| REACT_CLICKER_APP_BOT_TOKEN                       | Token for React Clicker bot                       | string                       |
| REACT_CLICKER_APP_POSTGRESQL_DATABASE_CONNECT_URL | PostgreSQL connection URL for clicker bot         | string                       |
| REACT_CLICKER_APP_GAME_URL                        | URL for React Clicker bot game                    | string                       |
| REACT_CLICKER_APP_SESSION_DURATION_S              | Session duration in seconds                       | string (converted to number) |
| REACT_CLICKER_APP_BOT_TIME_ZONE                   | Timezone for React Clicker bot                    | string                       |

> **Note:** all variables are validated on startup via `src/config/environment.ts`. Missing or malformed values will cause the application to fail fast with a descriptive error, so double-check your `.env` before launching. Bots that are not listed in `ENABLED_BOTS` are skipped entirely (including their env validation and migrations).

### Database Migrations

Run database migrations before starting the app:

```bash
pnpm run migrate:nbu              # NBU bot database
pnpm run migrate:react-clicker    # React Clicker DB (when `react_clicker` is enabled)
```

Use the corresponding `:undo` scripts to roll back the latest migration.

## Usage

Start the HTTP server (Express + routes):

```bash
pnpm start
```

Background workers and Telegram bots now run via separate entrypoints:

```bash
pnpm run start:all               # Start Express + both bots in a single process
pnpm run start:nbu-bot             # NBU Rate bot + its cron jobs
pnpm run start:react-clicker-bot   # React Clicker bot (only when `react_clicker` is enabled)
pnpm run start:dev                 # Express only (ts-node + nodemon)
pnpm run start:dev:all             # Express + bots in one ts-node dev process
```

## Project Structure

```plaintext
src/
│
├── config/
│ ├── inversify.config.ts
│ └── types.ts
│
├── helpers/
│ ├── logger.ts
│ └── ...
│
├── telegram/
│ ├── base-bot/
│ ├── common/
│ ├── nbu-rate-bot/
│ └── react-clicker-bot/
│
├── database/
│ └── nbu-rate-bot-user.entity.ts
│ └── react-clicker-bot/
│    └── react-clicker-bot-player.service.ts
│    └── react-clicker-bot.db.ts
│    └── react-clicker-bot.models.ts
│    └── types.ts
│
├── cron-jobs/
│ └── ...
│
└── server/
   └── express-server.ts
```

## License

This project is licensed under the MIT License.

---

**_TODO_**

- [x] **Remove consoles, add logger**: Replace all `console` statements with proper logging using the logger module.
- [x] **Limit requests**: Implement request limiting to prevent abuse.
- [ ] **Connect JIRA**: Integrate JIRA for project management and issue tracking.
- [ ] **Queue + Redis**: Implement a queuing system with Redis for better task management and performance.
- [ ] **Move under express control**: Manage the bot under Express for more flexible server actions (webhooks, etc.).
- [x] **Replace moment.js**: Use native code or something else lib

---

```

```

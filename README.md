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
   npm install
   ```

3. Create a .env file in the root directory and fill in the necessary environment variables.

## Configuration

| Variable name                                     | Description                                       | Type                         |
| ------------------------------------------------- | ------------------------------------------------- | ---------------------------- |
| ENV                                               | Current environment                               | development \| production    |
| LOG_LEVEL                                         | Setup logger                                      | FULL \| COMPACT \| NONE      |
| PORT                                              | App port                                          | number                       |
| CONTACT_URL                                       | Any URL for server response in app start          | string                       |
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
| REACT_CLICKER_FEATURE_ENABLED                     | Enable React Clicker bot/API modules (`true`/`false`) | string                    |

> **Note:** all variables are validated on startup via `src/config/environment.ts`. Missing or malformed values will cause the application to fail fast with a descriptive error, so double-check your `.env` before launching.

### Database Migrations

Run database migrations before starting the app:

```bash
npm run migrate:nbu              # NBU bot database
npm run migrate:react-clicker    # React Clicker DB (when the feature is enabled)
```

Use the corresponding `:undo` scripts to roll back the latest migration.

## Usage

To start the project, run:

```bash
npm start
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
- [ ] **Limit requests**: Implement request limiting to prevent abuse.
- [ ] **Connect JIRA**: Integrate JIRA for project management and issue tracking.
- [ ] **Queue + Redis**: Implement a queuing system with Redis for better task management and performance.
- [ ] **Move under express control**: Manage the bot under Express for more flexible server actions (webhooks, etc.).
- [x] **Replace moment.js**: Use native code or something else lib

---

```

```

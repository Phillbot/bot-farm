TODO:

- reg command for get curr by reglament ✅
- i18n\* ✅
- inversify ✅
- OOP ✅
- database for registration data ✅
- chart ✅

- remove consoles, add logger
- limit requests\*\*
- connect JIRA (?)
- queue + redis (?)
- webpack for build all file types

\*Use grammy i18n

\*\*At this moment its control by telegram because almost request send to telegram API

**ENV vars**

| Variable name                              | type                      |
| ------------------------------------------ | ------------------------- |
| ENV                                        | development \| production |
| PORT                                       | number                    |
| NBU_RATE_BOT_TOKEN                         | string                    |
| NBU_RATE_CRON_SCHEMA                       | \* \* \* \* \*            |
| NBU_RATE_EXCHANGE_API_URL                  | string                    |
| NBU_RATE_EXCHANGE_API_BY_DATE_AND_CURR_URL | string                    |
| NBU_RATE_EXCHANGE_CURRENCIES               | string (split by ,)       |
| NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA        | \* \* \* \* \*            |
| NBU_RATE_EXCHANGE_CRON_TIMEZONE            | string                    |
| POSTGRESQL_DATABASE_CONNECT_URL            | string                    |

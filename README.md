TODO:

- remove consoles, add logger
- reg command for get curr by reglament ✅
- i18
- database for collect log and registration data ✅
- connect JIRA (?)
- cron for chats
- custom reglament time (?)
- inversify ?
- OOP?
- limit requests?
- queue
- user save and update lang data

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
| POSTGRESQL_DATABASE_CONNECT_URL            | string                    |

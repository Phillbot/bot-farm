TODO:

- remove consoles, add logger
- limit requests\*\*
- connect JIRA (?)
- queue + redis (?)
- webpack for build all file types
- move under express control (more flexible actions with server (webhooks etc))

\*Use grammy i18n

\*\*At this moment its control by telegram because almost request send to telegram API

**ENV vars**

| Variable name                              | type                      |
| ------------------------------------------ | ------------------------- |
| ENV                                        | development \| production |
| PORT                                       | number                    |
| CONTACT_URL                                | string                    |
| NBU_RATE_BOT_TOKEN                         | string                    |
| NBU_RATE_CRON_SCHEMA                       | \* \* \* \* \*            |
| NBU_RATE_EXCHANGE_API_URL                  | string                    |
| NBU_RATE_WEB_LINK                          | string                    |
| NBU_RATE_EXCHANGE_API_BY_DATE_AND_CURR_URL | string                    |
| NBU_RATE_EXCHANGE_CURRENCIES               | string (split by ,)       |
| NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA        | \* \* \* \* \*            |
| NBU_RATE_EXCHANGE_CRON_TIMEZONE            | string                    |
| POSTGRESQL_DATABASE_CONNECT_URL            | string                    |

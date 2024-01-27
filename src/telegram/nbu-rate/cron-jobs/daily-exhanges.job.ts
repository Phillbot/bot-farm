import { CronJob } from 'cron';

import { nbuRateBot } from '../nbu-rate.bot';
import { NBUCurrencyRateUtils } from '../nbu-utils';

export const dailyExchanges = CronJob.from({
  cronTime: String(process.env.NBU_RATE_CRON_SCHEMA),
  onTick: async function () {
    const { data } = await NBUCurrencyRateUtils.getNBUExchangeRate();

    const convertCurrencyData =
      await NBUCurrencyRateUtils.getConvertCurrencyData(data, true, false, []);

    const message =
      NBUCurrencyRateUtils.createTableForMessage(convertCurrencyData);

    // TODO: add database and register/unregister command for subscribe

    const chatIds = [
      ...String(process.env.NBU_RATE_EXCHANGE_CHAT_ID).split(','),
    ];

    chatIds.forEach((chatId) => {
      nbuRateBot.api
        .sendMessage(
          chatId,
          NBUCurrencyRateUtils.createrMessage(
            message.table.toString(),
            '*Today NBU exchange:*\n\n',
          ),
          { parse_mode: 'MarkdownV2' },
        )
        .catch((error) => {
          // eslint-disable-next-line
          console.log(error);
        });
    });
  },
  start: true,
  timeZone: 'Europe/Kyiv',
});

import { CronJob } from 'cron';

import { botSubscribers } from '@database/postgresql/models/bot-subscribers.model';

import { nbuRateBot } from '../nbu-rate.bot';
import { NBUCurrencyRateUtils } from '../nbu-utils';
import { nbuTexts } from '../nbu-texts';

/**
 * Every time when we use part of find we cant use TS
 * https://sequelize.org/docs/v7/querying/select-in-depth/
 */

type ChatIdsData = {
  user_id: number | string;
};

export const dailyExchanges = CronJob.from({
  cronTime: String(process.env.NBU_RATE_CRON_SCHEMA),
  onTick: async function () {
    const { data } = await NBUCurrencyRateUtils.getNBUExchangeRate();

    const convertCurrencyData =
      await NBUCurrencyRateUtils.getConvertCurrencyData(data, true, false, []);

    const message =
      NBUCurrencyRateUtils.createTableForMessage(convertCurrencyData);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const chatIds: ChatIdsData[] = await botSubscribers.findAll({
      raw: true,
      attributes: ['user_id'],
      where: {
        is_subscribe_active: true,
      },
    });

    chatIds.forEach(({ user_id }) => {
      nbuRateBot.api
        .sendMessage(
          user_id,
          NBUCurrencyRateUtils.creatorMessage(
            message.table.toString(),
            `*${nbuTexts['today NBU exchange']['en']}:*\n\n`,
          ),
          { parse_mode: 'MarkdownV2' },
        )
        .catch((error) => {
          // eslint-disable-next-line
          console.log(error);
        });
    });
  },
  timeZone: 'Europe/Kyiv',
});

import moment from 'moment';
import { CronJob } from 'cron';
import { InputFile } from 'grammy';

import { botSubscribers } from '@database/postgresql/models/bot-subscribers.model';

import { nbuRateBot } from '../nbu-rate.bot';
import { nbuChartBuilder } from '../helpers/chart-builder.service';
import { nbuTexts } from '../helpers/nbu-texts';

/**
 * Every time when we use part of find we cant use TS
 * https://sequelize.org/docs/v7/querying/select-in-depth/
 */

type ChatIdsData = {
  user_id: number | string;
};

export const chart = CronJob.from({
  cronTime: String(process.env.NBU_RATE_EXCHANGE_CHART_CRON_SCHEMA),
  onTick: async function () {
    const { chart, startDate, endDate } = await nbuChartBuilder();

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
        .sendPhoto(user_id, new InputFile(chart), {
          parse_mode: 'HTML',
          caption: `<b>Weekly Chart</b>\n\n<code>${nbuTexts['chart period'][
            'en'
          ]
            .replace('{{startDate}}', moment(startDate).format('YYYY.MM.DD'))
            .replace(
              '{{endDate}}',
              moment(endDate).format('YYYY.MM.DD'),
            )}</code>`,
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log(error);
        });
    });
  },
  timeZone: 'Europe/Kyiv',
});

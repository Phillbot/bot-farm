import { CommandContext, InputFile } from 'grammy';
import { inject, injectable } from 'inversify';

import { defaultTimeZone } from '@config/date.config';

import { NBUChartPeriod, NBURateBotChartBuilder } from '../nbu-rate-chart-builder.service';
import { NBURateBotContext } from '../nbu-rate.utils';

@injectable()
export class NBURateBotBarChartCommand {
  constructor(
    @inject('Factory<NBURateBotChartBuilder>')
    private _nbuRateBotChartBuilder: (
      startDate: string,
      endDate: string,
      type: NBUChartPeriod,
    ) => NBURateBotChartBuilder,
  ) { }

  private useBotChartBuilderFactory() {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: defaultTimeZone }));
    const endDate = new Date(now);
    const startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const formatDate = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, '');

    return this._nbuRateBotChartBuilder(formatDate(startDate), formatDate(endDate), 'year').build();
  }

  public async withCtx(ctx: CommandContext<NBURateBotContext>): Promise<void> {
    const chart = await this.useBotChartBuilderFactory();
    await ctx.api.sendPhoto(ctx.chat.id, new InputFile(chart));
  }
}

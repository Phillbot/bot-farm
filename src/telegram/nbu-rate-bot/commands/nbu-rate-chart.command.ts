import { inject, injectable } from 'inversify';
import { CommandContext, InputFile } from 'grammy';

import { defaultTimeZone } from '@config/date.config';

import { NBURateBotContext } from '../nbu-rate.utils';
import { NBUChartPeriod, NBURateBotChartBuilder } from '../nbu-rate-chart-builder.service';

@injectable()
export class NBURateBotBarChartCommand {
  constructor(
    @inject('Factory<NBURateBotChartBuilder>')
    private _nbuRateBotChartBuilder: (
      startDate: string,
      endDate: string,
      type: NBUChartPeriod,
    ) => NBURateBotChartBuilder,
  ) {}

  private useBotChartBuilderFactory() {
    const startDate = new Date(new Date().toLocaleString('en-US', { timeZone: defaultTimeZone }));
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setMonth(startDate.getMonth() - 1);
    const formattedStartDate = startDate.toISOString().slice(0, 10).replace(/-/g, '');

    const endDate = new Date(new Date().toLocaleString('en-US', { timeZone: defaultTimeZone }));
    endDate.setMonth(0);
    endDate.setDate(1);
    const formattedEndDate = endDate.toISOString().slice(0, 10).replace(/-/g, '');

    return this._nbuRateBotChartBuilder(formattedStartDate, formattedEndDate, 'year').build();
  }

  public async withCtx(ctx: CommandContext<NBURateBotContext>): Promise<void> {
    const chart = await this.useBotChartBuilderFactory();
    await ctx.api.sendPhoto(ctx.chat.id, new InputFile(chart));
  }
}

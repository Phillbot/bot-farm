import moment from 'moment';
import { inject, injectable } from 'inversify';
import { CommandContext, InputFile } from 'grammy';

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
    const startDate = moment().subtract(1, 'year').subtract(1, 'month').format('YYYYMMDD');
    const endDate = moment().startOf('month').format('YYYYMMDD');

    return this._nbuRateBotChartBuilder(startDate, endDate, 'year').build();
  }

  public async withCtx(ctx: CommandContext<NBURateBotContext>): Promise<void> {
    const chart = await this.useBotChartBuilderFactory();
    await ctx.api.sendPhoto(ctx.chat.id, new InputFile(chart));
  }
}

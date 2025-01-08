import { inject, injectable } from 'inversify';
import uniqolor from 'uniqolor';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

import { NBURateBotUtils, NBURateType } from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { Logger } from '@helpers/logger';
import { NbuBotCurrencies } from './symbols';

export type NBUChartPeriod = 'month' | 'year';

// TODO: put methods of charts creating into a separate abstract builder

@injectable()
export class NBURateBotChartBuilder {
  constructor(
    @inject(NbuBotCurrencies.$)
    private readonly _nbuBotCurrencies: string,
    private readonly _logger: Logger,
    private readonly _nbuRateBotUtils: NBURateBotUtils,
    public _startDate: string,
    public _endDate: string,
    public _period: NBUChartPeriod,
  ) {}

  public async build(): Promise<Buffer> {
    try {
      const data = await this.fetchData();
      if (!data) {
        return Buffer.from('');
      }

      const finalizatedData = this._period === 'month' ? data : this.getFirstDayRates(data);

      if (!finalizatedData.length) {
        return Buffer.from('');
      }

      const labels = [...new Set(finalizatedData.map(({ exchangedate }) => exchangedate))];
      const datasets = this.createDatasets(finalizatedData);

      const chart =
        this._period === 'month'
          ? await this.createChartBufferLine(labels, datasets)
          : await this.createChartBufferBar(labels, datasets);

      return chart;
    } catch (error) {
      this._logger.error('An error occurred while building the chart:', error);
      return Buffer.from('');
    }
  }

  private async fetchData(): Promise<NBURateType[] | null> {
    const response = await this._nbuRateBotUtils.getNBUExchangeRateByPeriod(this._startDate, this._endDate);
    if (!response || !response.data) {
      this._logger.error('Failed to fetch exchange rate data');
      return null;
    }

    const currencies = this._nbuBotCurrencies?.split(',') ?? [];
    return response.data.filter(({ cc }) => currencies.includes(cc));
  }

  private createDatasets(data: NBURateType[]): ChartConfiguration['data']['datasets'] {
    const currencies = this._nbuBotCurrencies?.split(',') ?? [];
    return currencies.map((currency) => {
      const color = this.getColorByCurrency(currency);
      return {
        label: currency,
        data: data.filter(({ cc }) => cc === currency).map(({ rate }) => rate),
        fill: false,
        backgroundColor: color,
        borderColor: color,
        tension: 1,
      };
    });
  }

  private async createChartBufferBar(
    labels: string[],
    datasets: ChartConfiguration['data']['datasets'],
  ): Promise<Buffer> {
    const maxY = datasets.reduce((max, dataset) => Math.max(max, ...(dataset.data as number[])), 0) * 1.2;

    const chartConfig: ChartConfiguration = {
      plugins: [ChartDataLabels],
      type: 'bar',
      data: { labels, datasets },
      options: {
        indexAxis: 'x',
        plugins: {
          datalabels: {
            display: 'auto',
            anchor: 'end',
            align: 'top',
            font: { weight: 'bold' },
            backgroundColor: '#f2f2f2',
            borderRadius: 50,
            borderColor: '#595959',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            offset: true,
          },
          y: {
            beginAtZero: true,
            offset: true,
            max: maxY,
            ticks: {
              padding: 10,
            },
          },
        },
      },
    };

    const canvasRenderService = new ChartJSNodeCanvas({ width: 1920, height: 1080 });
    return await canvasRenderService.renderToBuffer(chartConfig);
  }

  private async createChartBufferLine(
    labels: string[],
    datasets: ChartConfiguration['data']['datasets'],
  ): Promise<Buffer> {
    const maxY = datasets.reduce((max, dataset) => Math.max(max, ...(dataset.data as number[])), 0) * 1.2;

    const chartConfig: ChartConfiguration = {
      plugins: [ChartDataLabels],
      type: 'line',
      data: { labels, datasets },
      options: {
        scales: {
          y: { type: 'linear', beginAtZero: true, max: maxY },
        },
        plugins: {
          datalabels: {
            align: 'end',
            anchor: 'center',
            display: 'auto',
            font: { weight: 'bold' },
          },
        },
      },
    };

    const canvasRenderService = new ChartJSNodeCanvas({ width: 1680, height: 1050 });
    return await canvasRenderService.renderToBuffer(chartConfig);
  }

  private getColorByCurrency(currency: string): string {
    const schema: Record<string, string> = {
      USD: '#85bb65',
      EUR: '#a653ec',
      CAD: '#4682b4',
      ILS: '#d53e07',
    };

    return schema[currency] ?? uniqolor(currency).color;
  }

  private getFirstDayRates(data: NBURateType[]): NBURateType[] {
    return data.filter(({ exchangedate }) => exchangedate.startsWith('01.'));
  }
}

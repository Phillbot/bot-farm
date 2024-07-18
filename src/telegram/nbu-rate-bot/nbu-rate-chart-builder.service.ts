import { inject, injectable, unmanaged } from 'inversify';
import uniqolor from 'uniqolor';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

import { NBURateBotUtils } from '@telegram/nbu-rate-bot/nbu-rate.utils';

@injectable()
export class NBURateBotChartBuilder {
  constructor(
    @inject(NBURateBotUtils) private readonly _nbuRateBotUtils: NBURateBotUtils,
    @unmanaged() private _startDate: string,
    @unmanaged() private _endDate: string,
  ) {}

  public async build(): Promise<Buffer> {
    const { data } = await this._nbuRateBotUtils.getNBUExchangeRateByPeriod(this._startDate, this._endDate);

    const currencies = process.env.NBU_RATE_EXCHANGE_CURRENCIES?.split(',') ?? [];
    const filteredData = data.filter(({ cc }) => currencies.includes(cc));

    const labels = [...new Set(filteredData.map(({ exchangedate }) => exchangedate))];

    const resolution = this.getResolution(labels);

    const canvasRenderService = new ChartJSNodeCanvas({ ...resolution });

    const datasets = currencies.map((currency) => ({
      label: currency,
      data: filteredData.filter(({ cc }) => cc === currency).map(({ rate }) => rate),
      fill: false,
      borderColor: uniqolor(currency, {
        format: 'rgb',
      }).color,
      tension: 0.1,
    }));

    const createChartBuffer = async () => {
      const chartConfig: ChartConfiguration = {
        plugins: [ChartDataLabels],
        type: 'line',
        data: {
          labels,
          datasets,
        },
        options: {
          plugins: {
            datalabels: {
              align: 'top',
              display: 'auto',
              font: {
                weight: 'bold',
              },
            },
          },
        },
      };

      const dataUrl = await canvasRenderService.renderToBuffer(chartConfig);
      return dataUrl;
    };

    const chart = await createChartBuffer();

    return chart;
  }

  private getResolution(labels: string[]): { width: number; height: number } {
    const FullHD = {
      width: 1920,
      height: 1080,
    };

    const HD = {
      width: 1280,
      height: 720,
    };

    const XGA = {
      width: 1024,
      height: 768,
    };

    const dataLength = labels.length;

    if (dataLength >= 100) {
      return FullHD;
    } else if (dataLength < 100 && dataLength >= 50) {
      return HD;
    } else return XGA;
  }

  readonly setDates = (startDate: string, endDate: string) => {
    this._startDate = startDate;
    this._endDate = endDate;
  };
}

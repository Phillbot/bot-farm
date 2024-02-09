import moment from 'moment';
import uniqolor from 'uniqolor';

import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import { inject, injectable } from 'inversify';
import { NBURateBotUtils } from './nbu-utils';

@injectable()
export class NBURateBotChartBuilder {
  private readonly _startDate = moment().startOf('year').format('YYYYMMDD');
  private readonly _endDate = moment().format('YYYYMMDD');

  constructor(
    @inject(NBURateBotUtils) private readonly _nbuRateBotUtils: NBURateBotUtils,
  ) {}

  public async build() {
    const { data } = await this._nbuRateBotUtils.getNBUExchangeRateByPeriod(
      this._startDate,
      this._endDate,
    );

    const currencies =
      process.env.NBU_RATE_EXCHANGE_CURRENCIES?.split(',') || [];
    const filteredData = data.filter(({ cc }) => currencies.includes(cc));

    const labels = [
      ...new Set(filteredData.map(({ exchangedate }) => exchangedate)),
    ];

    const resolution = this.getResolution(labels);

    const canvasRenderService = new ChartJSNodeCanvas({
      ...resolution,
    });

    const datasets = currencies.map((currency) => ({
      label: currency,
      data: filteredData
        .filter(({ cc }) => cc === currency)
        .map(({ rate }) => rate),
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

  public get dates() {
    return {
      startDate: this._startDate,
      endDate: this._endDate,
    };
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
}

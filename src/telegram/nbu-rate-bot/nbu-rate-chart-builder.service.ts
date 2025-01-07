import { inject, injectable } from 'inversify';
import uniqolor from 'uniqolor';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

import { NBURateBotUtils } from '@telegram/nbu-rate-bot/nbu-rate.utils';
import { Logger } from '@helpers/logger';
import { NbuBotCurrencies } from './symbols';

// TODO: make abstract builder

@injectable()
export class NBURateBotChartBuilder {
  constructor(
    @inject(NbuBotCurrencies.$)
    private readonly _nbuBotCurrencies: string,
    private readonly _logger: Logger,
    private readonly _nbuRateBotUtils: NBURateBotUtils,
    public _startDate: string,
    public _endDate: string,
  ) {}

  public async build(): Promise<Buffer> {
    try {
      // Fetch data
      const response = await this._nbuRateBotUtils.getNBUExchangeRateByPeriod(this._startDate, this._endDate);

      // Check if response and data exist
      if (!response || !response.data) {
        this._logger.error('Failed to fetch exchange rate data');
        return Buffer.from(''); // Return an empty buffer or a placeholder buffer
      }

      const { data } = response;

      const currencies = this._nbuBotCurrencies?.split(',') ?? [];
      const filteredData = data.filter(({ cc }) => currencies.includes(cc));

      // Ensure filteredData is not empty
      if (!filteredData.length) {
        this._logger.error('No data found for the specified currencies');
        return Buffer.from(''); // Return an empty buffer or a placeholder buffer
      }

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
    } catch (error) {
      this._logger.error('An error occurred while building the chart:', error);
      return Buffer.from(''); // Return an empty buffer or a placeholder buffer
    }
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

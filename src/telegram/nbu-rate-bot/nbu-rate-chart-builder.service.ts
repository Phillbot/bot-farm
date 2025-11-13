import { Chart, ChartConfiguration, ChartDataset, Plugin } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { inject, injectable } from 'inversify';
import uniqolor from 'uniqolor';

import { LoggerToken } from '@config/symbols';

import { Logger } from '@helpers/logger';

import { NBURateBotUtils, NBURateType } from '@telegram/nbu-rate-bot/nbu-rate.utils';

import { NbuBotCurrencies } from './symbols';

export type NBUChartPeriod = 'month' | 'year';

const MAX_SUMMARY_LINES = 6;

@injectable()
export class NBURateBotChartBuilder {
  constructor(
    @inject(NbuBotCurrencies.$)
    private readonly _nbuBotCurrencies: string,
    @inject(LoggerToken.$)
    private readonly _logger: Logger,
    private readonly _nbuRateBotUtils: NBURateBotUtils,
    public _startDate: string,
    public _endDate: string,
    public _period: NBUChartPeriod,
  ) { }

  public async build(): Promise<Uint8Array> {
    try {
      const data = await this.fetchData();
      if (!data) {
        return new Uint8Array();
      }

      const filteredData = this.filterByConfiguredCurrencies(data);
      if (!filteredData.length) {
        return new Uint8Array();
      }

      const dataForPeriod = this._period === 'month' ? filteredData : this.getFirstDayRates(filteredData);
      if (!dataForPeriod.length) {
        return new Uint8Array();
      }

      const sortedData = this.sortDataByDate(dataForPeriod);
      const labels = this.buildLabels(sortedData);
      const datasets = this.createDatasets(labels, sortedData);
      const summaryLines = this.buildSummary(sortedData);
      const summaryPlugin = this.createSummaryPlugin(summaryLines);

      const chart =
        this._period === 'month'
          ? await this.createChartBufferLine(labels, datasets, summaryPlugin)
          : await this.createChartBufferBar(labels, datasets, summaryPlugin);

      return chart;
    } catch (error) {
      this._logger.error('An error occurred while building the chart:', error);
      return new Uint8Array();
    }
  }

  private async fetchData(): Promise<NBURateType[] | null> {
    const response = await this._nbuRateBotUtils.getNBUExchangeRateByPeriod(this._startDate, this._endDate);
    if (!response || !response.data) {
      this._logger.error('Failed to fetch exchange rate data');
      return null;
    }

    return response.data;
  }

  private buildLabels(data: NBURateType[]): string[] {
    return [
      ...new Set(
        data
          .map(({ exchangedate }) => exchangedate)
          .sort((a, b) => this.parseExchangeDate(a).getTime() - this.parseExchangeDate(b).getTime()),
      ),
    ];
  }

  private createDatasets(labels: string[], data: NBURateType[]): ChartDataset<'line' | 'bar'>[] {
    const currencies = this.getConfiguredCurrencies();
    const valuesByCurrency = new Map<string, Map<string, number>>();

    for (const entry of data) {
      if (!valuesByCurrency.has(entry.cc)) {
        valuesByCurrency.set(entry.cc, new Map());
      }

      valuesByCurrency.get(entry.cc)?.set(entry.exchangedate, entry.rate);
    }

    return currencies.map((currency) => {
      const currencyValues = valuesByCurrency.get(currency) ?? new Map();
      const color = this.getColorByCurrency(currency);

      return {
        label: currency,
        data: labels.map((label) => currencyValues.get(label) ?? Number.NaN),
        fill: false,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        tension: 0.3,
        spanGaps: true,
        pointRadius: 2,
        pointHoverRadius: 4,
      };
    });
  }

  private async createChartBufferBar(
    labels: string[],
    datasets: ChartDataset<'line' | 'bar'>[],
    summaryPlugin?: Plugin,
  ): Promise<Uint8Array> {
    const maxY = this.getMaxValue(datasets) * 1.2 || 10;
    const plugins = [this.customDataLabelPlugin, summaryPlugin].filter(Boolean) as Plugin[];

    const chartConfig: ChartConfiguration = {
      plugins,
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: false,
        animation: false,
        indexAxis: 'x',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true },
          },
          title: {
            display: true,
            text: 'Розкладка курсів за рік',
            font: { weight: 'bold', size: 18 },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            offset: true,
            title: { display: true, text: 'Місяць', font: { weight: 'bold' } },
            grid: { color: '#e5e7eb', drawBorder: false },
            ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 },
          },
          y: {
            beginAtZero: true,
            max: maxY,
            title: { display: true, text: 'Курс', font: { weight: 'bold' } },
            grid: { color: '#e5e7eb', drawBorder: false },
          },
        },
      },
    };

    const canvasRenderService = new ChartJSNodeCanvas({ width: 1920, height: 1080 });
    const buffer = await canvasRenderService.renderToBuffer(chartConfig);
    return new Uint8Array(buffer);
  }

  private async createChartBufferLine(
    labels: string[],
    datasets: ChartDataset<'line' | 'bar'>[],
    summaryPlugin?: Plugin,
  ): Promise<Uint8Array> {
    const maxY = this.getMaxValue(datasets) * 1.2 || 10;
    const plugins = [ChartDataLabels, summaryPlugin].filter(Boolean) as Plugin[];

    const chartConfig: ChartConfiguration = {
      plugins,
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: false,
        animation: false,
        interaction: { intersect: false },
        scales: {
          x: {
            title: { display: true, text: 'Дата', font: { weight: 'bold' } },
            grid: { color: '#e5e7eb', drawBorder: false },
            ticks: { maxRotation: 0, autoSkip: true },
          },
          y: {
            type: 'linear',
            beginAtZero: true,
            max: maxY,
            title: { display: true, text: 'Курс', font: { weight: 'bold' } },
            grid: { color: '#e5e7eb', drawBorder: false },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true },
          },
          title: {
            display: true,
            text: 'Курси валют за останні 30 днів',
            font: { weight: 'bold', size: 18 },
          },
          datalabels: {
            align: 'end',
            anchor: 'center',
            display: 'auto',
            color: '#111827',
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: 4,
            padding: { top: 2, bottom: 2, left: 4, right: 4 },
            font: { weight: 'bold', size: 10 },
            formatter: (value: number | null) => {
              if (value === null || Number.isNaN(value)) {
                return '';
              }

              return value.toFixed(2);
            },
          },
        },
      },
    };

    const canvasRenderService = new ChartJSNodeCanvas({ width: 1680, height: 1050 });
    const buffer = await canvasRenderService.renderToBuffer(chartConfig);
    return new Uint8Array(buffer);
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

  private parseExchangeDate(date: string): Date {
    const [day, month, year] = date.split('.');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  private sortDataByDate(data: NBURateType[]): NBURateType[] {
    return [...data].sort(
      (a, b) => this.parseExchangeDate(a.exchangedate).getTime() - this.parseExchangeDate(b.exchangedate).getTime(),
    );
  }

  private getConfiguredCurrencies(): string[] {
    return this._nbuBotCurrencies
      ?.split(',')
      .map((currency) => currency.trim().toUpperCase())
      .filter(Boolean) ?? [];
  }

  private filterByConfiguredCurrencies(data: NBURateType[]): NBURateType[] {
    const configured = this.getConfiguredCurrencies();
    if (!configured.length) {
      return [];
    }

    return data.filter(({ cc }) => configured.includes(cc));
  }

  private getMaxValue(datasets: ChartDataset<'line' | 'bar'>[]): number {
    return datasets.reduce((max, dataset) => {
      const numericValues = (dataset.data as number[]).map((value) => (Number.isNaN(value) ? 0 : value));
      const datasetMax = numericValues.length ? Math.max(...numericValues) : 0;
      return Math.max(max, datasetMax);
    }, 0);
  }

  private buildSummary(data: NBURateType[]): string[] {
    const grouped = new Map<string, NBURateType[]>();

    for (const entry of data) {
      if (!grouped.has(entry.cc)) {
        grouped.set(entry.cc, []);
      }

      grouped.get(entry.cc)?.push(entry);
    }

    const summaryLines = [...grouped.entries()].map(([currency, entries]) => {
      const sortedEntries = this.sortDataByDate(entries);
      const first = sortedEntries[0];
      const last = sortedEntries[sortedEntries.length - 1];

      if (!first || !last) {
        return `${currency}: недостатньо даних`;
      }

      const change = last.rate - first.rate;
      const percent = first.rate === 0 ? 0 : (change / first.rate) * 100;
      const format = (value: number) => value.toFixed(2);
      const sign = change >= 0 ? '+' : '';
      const percentSign = percent >= 0 ? '+' : '';

      return `${currency}: ${format(first.rate)} → ${format(last.rate)} (${sign}${format(change)} | ${percentSign}${percent.toFixed(
        2,
      )}%)`;
    });

    return summaryLines.sort((a, b) => a.localeCompare(b)).slice(0, MAX_SUMMARY_LINES);
  }

  private createSummaryPlugin(summaryLines: string[]): Plugin | undefined {
    if (!summaryLines.length) {
      return undefined;
    }

    return {
      id: 'summaryOverlay',
      afterDraw: (chart: Chart) => {
        const { ctx, chartArea } = chart;
        ctx.save();

        const padding = 12;
        const lineHeight = 16;
        ctx.font = 'bold 12px Arial';
        const maxTextWidth = Math.max(
          ctx.measureText('Δ за період').width,
          ...summaryLines.map((line) => ctx.measureText(line).width),
        );

        const boxWidth = maxTextWidth + padding * 2;
        const boxHeight = padding * 2 + lineHeight * (summaryLines.length + 1);
        const x = chartArea.left + 16;
        const y = chartArea.top + 16;

        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.strokeStyle = 'rgba(55,65,81,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#111827';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Δ за період', x + padding, y + padding + 2);

        ctx.font = '11px Arial';
        summaryLines.forEach((line, index) => {
          ctx.fillText(line, x + padding, y + padding + 18 + lineHeight * index);
        });

        ctx.restore();
      },
    };
  }

  private customDataLabelPlugin = {
    id: 'customDataLabel',
    afterDatasetsDraw: (chart: Chart) => {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);

        meta.data.forEach((bar, index) => {
          const value = dataset.data[index];
          const numericValue = typeof value === 'number' && !Number.isNaN(value) ? value : null;

          if (numericValue !== null) {
            const x = bar.x;
            const y = bar.y - 10;

            const fontSize = 12;
            const padding = 10;
            const borderRadius = 8;
            const text = numericValue.toFixed(2);
            const textWidth = ctx.measureText(text).width;
            const boxWidth = textWidth + padding * 2;
            const boxHeight = fontSize + padding;

            const boxX = x - boxWidth / 2;
            const boxY = y - boxHeight - 3;

            ctx.save();
            ctx.fillStyle = '#f2f2f2';
            ctx.strokeStyle = '#595959';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'black';
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(text, x, y - boxHeight / 2 - 2);
            ctx.restore();
          }
        });
      });
    },
  };
}

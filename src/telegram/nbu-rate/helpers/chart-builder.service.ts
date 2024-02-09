import moment from 'moment';

import uniqolor from 'uniqolor';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

import { NBUCurrencyRateUtils } from './nbu-utils';

export const nbuChartBuilder = async () => {
  const startDate = moment().startOf('year').format('YYYYMMDD');
  const endDate = moment().format('YYYYMMDD');

  const { data } = await NBUCurrencyRateUtils.getNBUExchangeRateByPeriod(
    startDate,
    endDate,
  );

  const currencies = process.env.NBU_RATE_EXCHANGE_CURRENCIES?.split(',') || [];
  const filteredData = data.filter(({ cc }) => currencies.includes(cc));

  const labels = [
    ...new Set(filteredData.map(({ exchangedate }) => exchangedate)),
  ];

  const resolution = getResolution(labels);

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

  return { chart, startDate, endDate };
};

function getResolution(labels: string[]): { width: number; height: number } {
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

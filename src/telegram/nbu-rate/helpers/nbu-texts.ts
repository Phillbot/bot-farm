import { LangType } from 'types/lang';

type NBUTextType = Record<string, Record<LangType, string>>;

export const nbuTexts: NBUTextType = {
  ['start']: {
    ['en']:
      'Hi! You can get NBU exchange rate by command /rate or send /subscribe for get it automatically every day at 9am and 6pm',
    ['uk']:
      'Привіт! Ви можете отримати курс НБУ за допомогою команди /rate або відправити /підписатись на автоматичне отримання курсу щодня о 9:00 та 18:00.',
  },
  ['subscribe deactivated']: {
    ['en']: 'Done, subscribe deactivated',
    ['uk']: 'Готово, підписку деактивовано',
  },
  ['subscribe not active']: {
    ['en']: 'Subscribe not active, send /subscribe to active',
    ['uk']: 'Підписка не активна, надіслати /підписатись на активну',
  },
  ['subscribe already active']: {
    ['en']: 'Subscribe already active',
    ['uk']: 'Підписка вже активна',
  },
  ['subscribe activated']: {
    ['en']: 'Done, subscribe activated',
    ['uk']: 'отово, підписку активовано',
  },
  ['today NBU exchange']: {
    ['en']: 'Today NBU exchange',
    ['uk']: 'Курс НБУ на сьогодні',
  },
  ['chart period']: {
    ['en']: 'Period from {{startDate}} to {{endDate}}',
    ['uk']: 'Період з {{startDate}} по {{endDate}}',
  },
};

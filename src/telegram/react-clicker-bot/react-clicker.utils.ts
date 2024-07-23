export enum COMMANDS {
  START = 'start',
  PLAY = 'play',
}

export const defaultLang = 'uk' as const;
export const supportLangs = [defaultLang, 'en', 'ru'] as const;

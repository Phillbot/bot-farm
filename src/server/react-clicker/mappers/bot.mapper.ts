import { BotMapping } from '@database/react-clicker-bot/types';
import { UserFromGetMe } from 'grammy/types';

export function mapBot(bot: UserFromGetMe): BotMapping {
  return {
    canConnectToBusiness: bot.can_connect_to_business,
    canJoinGroups: bot.can_join_groups,
    canReadAllGroupMessages: bot.can_read_all_group_messages,
    firstName: bot.first_name,
    id: bot.id,
    isBot: bot.is_bot,
    supportsInlineQueries: bot.supports_inline_queries,
    username: bot.username,
  };
}

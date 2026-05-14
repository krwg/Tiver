export const GUEST_SEGMENT_META = {
  feed: { title: 'Новости', label: 'Новости' },
  messages: { title: 'Сообщения', label: 'Сообщения' },
  groups: { title: 'Сообщества', label: 'Сообщества' },
  friends: { title: 'Друзья', label: 'Друзья' },
  games: { title: 'Игры', label: 'Игры' },
  settings: { title: 'Настройки', label: 'Настройки' },
};

export const GUEST_NAV = [
  { segment: 'feed', href: '/guest/feed' },
  { segment: 'messages', href: '/guest/messages' },
  { segment: 'groups', href: '/guest/groups' },
  { segment: 'friends', href: '/guest/friends' },
  { segment: 'games', href: '/guest/games' },
  { segment: 'settings', href: '/guest/settings' },
];

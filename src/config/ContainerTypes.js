export const TASK_TYPES = {
  subscribe: {
    label: 'Подписка на каналы',
    description: 'Требуется подписка на определенные каналы',
    requiresData: true,
    dataType: 'channels'
  },
  referral: {
    label: 'Приглашение рефералов',
    description: 'Необходимо пригласить определенное количество рефералов',
    requiresData: true,
    dataType: 'number'
  },
  deposit: {
    label: 'Пополнение баланса',
    description: 'Требуется пополнить баланс на определенную сумму',
    requiresData: true,
    dataType: 'amount'
  },
  level: {
    label: 'Уровень пользователя',
    description: 'Требуется достичь определенного уровня',
    requiresData: true,
    dataType: 'number'
  }
};

export const CONTAINER_TYPES = ['free', 'coins', 'usdt'];
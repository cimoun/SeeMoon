// Пример входных данных процесса согласования договора

export const contractApprovalSpec = {
  meta: {
    title: 'Согласование договора',
    description:
      'Классический цикл согласования: автор готовит документ, система уведомляет участников, согласующий принимает решение с возможностью возврата на доработку.',
    version: 'MVP · 2025-11-25'
  },
  layout: {
    laneHeight: 170,
    columnGap: 230,
    paddingX: 140,
    paddingY: 80
  },
  lanes: [
    { id: 'author', label: 'Автор', accent: '#0ea5e9' },
    { id: 'system', label: 'Система', accent: '#a855f7' },
    { id: 'approver', label: 'Согласующий', accent: '#f97316' }
  ],
  elements: [
    { id: 'start', type: 'startEvent', label: 'Новый запрос', lane: 'author', status: 'info' },
    { id: 'draft', type: 'task', label: 'Создать договор', lane: 'author', status: 'draft' },
    { id: 'self-check', type: 'task', label: 'Самопроверка', lane: 'author', status: 'in-progress' },
    { id: 'needs-edit', type: 'xorGateway', label: 'Изменить?', lane: 'author' },
    { id: 'edit', type: 'task', label: 'Внести правки', lane: 'author', status: 'rework' },
    {
      id: 'submit',
      type: 'task',
      label: 'Отправить на согласование',
      lane: 'author',
      status: 'waiting'
    },
    {
      id: 'register',
      type: 'task',
      label: 'Зарегистрировать запрос',
      lane: 'system',
      status: 'system'
    },
    {
      id: 'notify',
      type: 'intermediateEvent',
      label: 'Уведомить участников',
      lane: 'system',
      status: 'info'
    },
    { id: 'review', type: 'task', label: 'Проверить договор', lane: 'approver', status: 'review' },
    { id: 'decision', type: 'xorGateway', label: 'Одобрить?', lane: 'approver' },
    { id: 'approve', type: 'endEvent', label: 'Утверждено', lane: 'approver', status: 'success' },
    {
      id: 'reject',
      type: 'task',
      label: 'Вернуть с комментариями',
      lane: 'approver',
      status: 'rejected'
    },
    {
      id: 'author-rework',
      type: 'task',
      label: 'Учесть комментарии',
      lane: 'author',
      status: 'rework'
    }
  ],
  flows: [
    { id: 'f1', from: 'start', to: 'draft' },
    { id: 'f2', from: 'draft', to: 'self-check' },
    { id: 'f3', from: 'self-check', to: 'needs-edit' },
    { id: 'f4', from: 'needs-edit', to: 'edit', label: 'Да' },
    { id: 'f5', from: 'needs-edit', to: 'submit', label: 'Нет' },
    { id: 'f6', from: 'edit', to: 'self-check', label: 'После правок', behavior: 'loop' },
    { id: 'f7', from: 'submit', to: 'register' },
    { id: 'f8', from: 'register', to: 'notify' },
    { id: 'f9', from: 'notify', to: 'review' },
    { id: 'f10', from: 'review', to: 'decision' },
    { id: 'f11', from: 'decision', to: 'approve', label: 'Одобрить' },
    { id: 'f12', from: 'decision', to: 'reject', label: 'Вернуть' },
    { id: 'f13', from: 'reject', to: 'author-rework' },
    { id: 'f14', from: 'author-rework', to: 'self-check', label: 'Новая версия', behavior: 'loop' }
  ]
};

export const examples = [
  {
    id: 'contract',
    label: 'Согласование договора',
    spec: contractApprovalSpec
  }
];

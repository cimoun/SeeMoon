// Пример диаграммы: Согласование договора
export const sampleDiagrams = {
  contractApproval: {
    name: "Согласование договора",
    description: "Процесс создания и согласования договора с контрагентом",
    lanes: [
      { id: "lane-author", name: "Автор", color: "#58a6ff" },
      { id: "lane-system", name: "Система", color: "#7ee787" },
      { id: "lane-approver", name: "Согласующий", color: "#a371f7" }
    ],
    elements: [
      // Автор
      { id: "start", type: "startEvent", label: "Начало", lane: "lane-author" },
      { id: "t1", type: "task", label: "Создать договор", lane: "lane-author" },
      { id: "t2", type: "task", label: "Заполнить данные контрагента", lane: "lane-author" },
      { id: "g1", type: "xorGateway", label: "Тип договора?", lane: "lane-author" },
      { id: "t3", type: "task", label: "Указать условия поставки", lane: "lane-author" },
      { id: "t4", type: "task", label: "Указать условия оплаты", lane: "lane-author" },
      { id: "g2", type: "xorGateway", lane: "lane-author" },
      { id: "t5", type: "task", label: "Отправить на согласование", lane: "lane-author" },
      
      // Система
      { id: "t6", type: "task", label: "Проверить заполнение", lane: "lane-system" },
      { id: "g3", type: "xorGateway", label: "Данные корректны?", lane: "lane-system" },
      { id: "t7", type: "task", label: "Создать задачу согласующему", lane: "lane-system" },
      { id: "t8", type: "task", label: "Уведомить автора об ошибках", lane: "lane-system" },
      
      // Согласующий
      { id: "t9", type: "task", label: "Рассмотреть договор", lane: "lane-approver" },
      { id: "g4", type: "xorGateway", label: "Решение?", lane: "lane-approver" },
      { id: "t10", type: "task", label: "Указать замечания", lane: "lane-approver" },
      { id: "t11", type: "task", label: "Согласовать договор", lane: "lane-approver" },
      { id: "t12", type: "task", label: "Отклонить договор", lane: "lane-approver" },
      
      // Завершение (в системе)
      { id: "g5", type: "xorGateway", lane: "lane-system" },
      { id: "t13", type: "task", label: "Зарегистрировать договор", lane: "lane-system" },
      { id: "end-success", type: "endEvent", label: "Договор зарегистрирован", lane: "lane-system" },
      { id: "end-rejected", type: "endEvent", label: "Договор отклонён", lane: "lane-system" }
    ],
    flows: [
      { from: "start", to: "t1" },
      { from: "t1", to: "t2" },
      { from: "t2", to: "g1" },
      { from: "g1", to: "t3", label: "Поставка" },
      { from: "g1", to: "t4", label: "Услуги" },
      { from: "t3", to: "g2" },
      { from: "t4", to: "g2" },
      { from: "g2", to: "t5" },
      { from: "t5", to: "t6" },
      { from: "t6", to: "g3" },
      { from: "g3", to: "t7", label: "Да" },
      { from: "g3", to: "t8", label: "Нет" },
      { from: "t8", to: "t2", label: "", type: "return" },
      { from: "t7", to: "t9" },
      { from: "t9", to: "g4" },
      { from: "g4", to: "t11", label: "Согласовать" },
      { from: "g4", to: "t10", label: "На доработку" },
      { from: "g4", to: "t12", label: "Отклонить" },
      { from: "t10", to: "t2", label: "", type: "return" },
      { from: "t11", to: "g5" },
      { from: "t12", to: "g5" },
      { from: "g5", to: "t13", label: "Согласован" },
      { from: "g5", to: "end-rejected", label: "Отклонён" },
      { from: "t13", to: "end-success" }
    ]
  },
  
  orderProcessing: {
    name: "Обработка заказа",
    description: "Процесс обработки заказа от клиента",
    lanes: [
      { id: "lane-client", name: "Клиент", color: "#58a6ff" },
      { id: "lane-sales", name: "Отдел продаж", color: "#7ee787" },
      { id: "lane-warehouse", name: "Склад", color: "#a371f7" },
      { id: "lane-delivery", name: "Доставка", color: "#d29922" }
    ],
    elements: [
      { id: "start", type: "startEvent", label: "Заказ получен", lane: "lane-client" },
      { id: "t1", type: "task", label: "Оформить заказ", lane: "lane-client" },
      { id: "t2", type: "task", label: "Подтвердить заказ", lane: "lane-sales" },
      { id: "g1", type: "xorGateway", label: "Товар в наличии?", lane: "lane-sales" },
      { id: "t3", type: "task", label: "Зарезервировать товар", lane: "lane-warehouse" },
      { id: "t4", type: "task", label: "Заказать у поставщика", lane: "lane-warehouse" },
      { id: "g2", type: "parallelGateway", lane: "lane-warehouse" },
      { id: "t5", type: "task", label: "Собрать заказ", lane: "lane-warehouse" },
      { id: "t6", type: "task", label: "Подготовить документы", lane: "lane-sales" },
      { id: "g3", type: "parallelGateway", lane: "lane-warehouse" },
      { id: "t7", type: "task", label: "Передать в доставку", lane: "lane-warehouse" },
      { id: "t8", type: "task", label: "Доставить клиенту", lane: "lane-delivery" },
      { id: "t9", type: "task", label: "Получить заказ", lane: "lane-client" },
      { id: "end", type: "endEvent", label: "Заказ выполнен", lane: "lane-client" }
    ],
    flows: [
      { from: "start", to: "t1" },
      { from: "t1", to: "t2" },
      { from: "t2", to: "g1" },
      { from: "g1", to: "t3", label: "Да" },
      { from: "g1", to: "t4", label: "Нет" },
      { from: "t3", to: "g2" },
      { from: "t4", to: "g2" },
      { from: "g2", to: "t5" },
      { from: "g2", to: "t6" },
      { from: "t5", to: "g3" },
      { from: "t6", to: "g3" },
      { from: "g3", to: "t7" },
      { from: "t7", to: "t8" },
      { from: "t8", to: "t9" },
      { from: "t9", to: "end" }
    ]
  },
  
  simpleProcess: {
    name: "Простой процесс",
    description: "Базовый линейный процесс для демонстрации",
    lanes: [
      { id: "lane-1", name: "Исполнитель", color: "#58a6ff" }
    ],
    elements: [
      { id: "start", type: "startEvent", label: "Начало", lane: "lane-1" },
      { id: "t1", type: "task", label: "Задача 1", lane: "lane-1" },
      { id: "t2", type: "task", label: "Задача 2", lane: "lane-1" },
      { id: "t3", type: "task", label: "Задача 3", lane: "lane-1" },
      { id: "end", type: "endEvent", label: "Конец", lane: "lane-1" }
    ],
    flows: [
      { from: "start", to: "t1" },
      { from: "t1", to: "t2" },
      { from: "t2", to: "t3" },
      { from: "t3", to: "end" }
    ]
  }
}

// ==================== ШАГ 1: ОТКРЫВАЕМ БАЗУ ДАННЫХ ====================

// indexedDB.open() - это метод для открытия или создания базы данных
// Первый параметр "MyDatabase" - это название нашей базы
// Второй параметр 1 - это версия базы (если меняем структуру, увеличиваем версию)
const openRequest = indexedDB.open("MyDatabase", 1);

// ==================== ШАГ 2: СОЗДАЕМ ТАБЛИЦУ ====================

// onupgradeneeded сработает ТОЛЬКО в двух случаях:
// 1. Когда база создается впервые
// 2. Когда мы увеличиваем версию (например, с 1 на 2)
openRequest.onupgradeneeded = function(event) {
  // event.target.result - это наша база данных
  const db = event.target.result;
  
  // createObjectStore() создает таблицу (в IndexedDB это называется "хранилище объектов")
  // "friends" - название нашей таблицы
  // { keyPath: "id", autoIncrement: true } - настройки:
  //   - keyPath: "id" значит, что у каждой записи будет поле "id"
  //   - autoIncrement: true значит, что id будет автоматически увеличиваться (1, 2, 3...)
  db.createObjectStore("friends", { keyPath: "id", autoIncrement: true });
  
  // Таблица создана
  console.log("Таблица 'friends' создана!");
};

// ==================== ШАГ 3: БАЗА УСПЕШНО ОТКРЫТА ====================

// onsuccess сработает, когда база успешно откроется
openRequest.onsuccess = function(event) {
  // Получаем доступ к базе данных
  const db = event.target.result;
  console.log("База данных открыта и готова к работе!");
  
  // Сохраняем базу в глобальную переменную, чтобы использовать в других функциях
  window.db = db;
  
  // addFriend НИЖЕ
  // Добавим пару друзей для примера
  addFriend("Анна", 25);
  addFriend("Иван", 30);
};

// ==================== ШАГ 4: ОБРАБОТКА ОШИБОК ====================

// onerror сработает, если что-то пойдет не так
openRequest.onerror = function() {
  console.error("Ой! Не удалось открыть базу данных");
};

// ==================== ШАГ 5: ФУНКЦИЯ ДЛЯ ДОБАВЛЕНИЯ ДАННЫХ ====================

function addFriend(name, age) {
  // Проверяем, открыта ли база
  if (!window.db) {
    console.error("База данных еще не открыта!");
    return;
  }
  
  // transaction() создает транзакцию - это как "сеанс работы" с базой
  // "friends" - с какой таблицей работаем
  // "readwrite" - режим доступа: можем и читать, и писать
  const transaction = window.db.transaction("friends", "readwrite");
  
  // objectStore() получает нашу таблицу "friends"
  const friendsStore = transaction.objectStore("friends");
  
  // Создаем объект с данными друга
  // Поле "id" НЕ указываем - оно создастся автоматически благодаря autoIncrement
  const friend = {
    name: name,
    age: age,
    added: new Date() // добавляем дату создания
  };
  
  // add() добавляет объект в таблицу
  const request = friendsStore.add(friend);
  
  // Когда добавление успешно
  request.onsuccess = function() {
    console.log(`Друг ${name} добавлен!`);
  };
  
  // Если ошибка при добавлении
  request.onerror = function() {
    console.error(`Не удалось добавить друга ${name}`);
  };
}

// ==================== ШАГ 6: ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ВСЕХ ДАННЫХ ====================

function getAllFriends() {
  if (!window.db) {
    console.error("База данных еще не открыта!");
    return;
  }
  
  // Создаем транзакцию в режиме "readonly" (только чтение)
  const transaction = window.db.transaction("friends", "readonly");
  const friendsStore = transaction.objectStore("friends");
  
  // getAll() получает ВСЕ записи из таблицы
  const request = friendsStore.getAll();
  
  request.onsuccess = function(event) {
    // event.target.result - это массив всех друзей
    const allFriends = event.target.result;
    console.log("Все друзья в базе:", allFriends);
    
    // Выводим в консоль красиво
    allFriends.forEach(friend => {
      console.log(`ID: ${friend.id}, Имя: ${friend.name}, Возраст: ${friend.age}`);
    });
  };
  
  request.onerror = function() {
    console.error("Не удалось получить данные");
  };
}

// ==================== ШАГ 7: ФУНКЦИЯ ДЛЯ ПОИСКА ПО ID ====================

function getFriendById(id) {
  if (!window.db) {
    console.error("База данных еще не открыта!");
    return;
  }
  
  const transaction = window.db.transaction("friends", "readonly");
  const friendsStore = transaction.objectStore("friends");
  
  // get() получает одну запись по ID
  const request = friendsStore.get(id);
  
  request.onsuccess = function(event) {
    const friend = event.target.result;
    if (friend) {
      console.log(`Найден друг: ${friend.name}, возраст: ${friend.age}`);
    } else {
      console.log(`Друг с ID=${id} не найден`);
    }
  };
}

// ==================== ШАГ 8: ФУНКЦИЯ ДЛЯ УДАЛЕНИЯ ====================

function deleteFriend(id) {
  if (!window.db) {
    console.error("База данных еще не открыта!");
    return;
  }
  
  const transaction = window.db.transaction("friends", "readwrite");
  const friendsStore = transaction.objectStore("friends");
  
  // delete() удаляет запись по ID
  const request = friendsStore.delete(id);
  
  request.onsuccess = function() {
    console.log(`Друг с ID=${id} удален`);
    // После удаления покажем обновленный список
    getAllFriends();
  };
  
  request.onerror = function() {
    console.error(`Не удалось удалить друга с ID=${id}`);
  };
}


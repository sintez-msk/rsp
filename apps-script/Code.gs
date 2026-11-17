/**
 * Расписание мероприятий
 * Читает Google Таблицу и отдаёт события на веб-страницу.
 */

/** ID Google Таблицы — источник данных для страницы. */
var SPREADSHEET_ID = '1zdSZ-PkBbuHtGkHHaqgCSIHrF-50EJgoRftsVPVmd18';

/** Имя листа (если нет — берётся первый лист книги). */
var SHEET_NAME = 'События';

/** Часовой пояс для сравнения «сейчас» и фильтра прошедших. */
var TZ = 'Europe/Moscow';

var HEADER_ALIASES = {
  date: ['date', 'дата'],
  end_date: ['end_date', 'enddate', 'дата_конца', 'дата конца'],
  start: ['start', 'начало', 'время', 'время_начала', 'время начала'],
  end: ['end', 'конец', 'время_конца', 'время конца'],
  place: ['place', 'место', 'площадка', 'формат'],
  title: ['title', 'название', 'мероприятие', 'название мероприятия'],
  participants: ['participants', 'участники', 'описание'],
  leader: ['leader', 'ведущий', 'ведущие', 'спикер', 'спикер / организатор', 'организатор'],
  color: ['color', 'цвет'],
  link: ['link', 'ссылка', 'url', 'ссылка на подключение'],
  status: ['status', 'статус']
};

var STATUS_COLORS = {
  'запланировано': '#dde7ee',
  'в процессе': '#e7ebbc',
  'завершено': '#e5e5e5'
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Расписание синтез-деятельности')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Возвращает события для календаря и списка.
 * Вызывается из Index.html через google.script.run.
 */
function getEvents() {
  var sheet = getEventsSheet_();
  // Важно: displayValues = как видно в таблице, без сдвига часового пояса Date.
  var values = sheet.getDataRange().getDisplayValues();
  if (!values || !values.length) {
    return [];
  }

  var headerInfo = detectHeader_(values);
  var events = [];
  // Сейчас по Москве: события, которые уже закончились, на сайт не отдаём.
  var nowMoscow = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ss");

  for (var r = headerInfo.dataStart; r < values.length; r++) {
    var row = values[r];
    var title = cellString_(row, headerInfo.map.title);
    var date = normalizeDate_(row[headerInfo.map.date]);
    if (!title || !date) {
      continue;
    }

    var endDate = normalizeDate_(row[headerInfo.map.end_date]);
    var startTime = normalizeTime_(row[headerInfo.map.start]);
    var endTime = normalizeTime_(row[headerInfo.map.end]);
    var place = cellString_(row, headerInfo.map.place);
    var link = cellString_(row, headerInfo.map.link) || extractUrl_(place);
    var status = cellString_(row, headerInfo.map.status);
    var participants = cellString_(row, headerInfo.map.participants);
    var leader = cellString_(row, headerInfo.map.leader);
    var color = cellString_(row, headerInfo.map.color);

    // Убираем URL из текста места — на сайте он станет кликабельной ссылкой.
    if (link && place) {
      place = place.split(link).join(' ');
      place = place.replace(/\s*[·|]\s*/g, ' ').replace(/\s+/g, ' ').trim();
    }
    if (!place && link) {
      place = 'Онлайн';
    }

    if (status && participants) {
      participants = status + ' · ' + participants;
    } else if (status) {
      participants = status;
    }

    if (!color) {
      color = STATUS_COLORS[status.toLowerCase()] || '#dde7ee';
    }

    var startIso = combineDateTime_(date, startTime || '00:00');
    var endIsoDate = endDate || date;
    var endIso = combineDateTime_(endIsoDate, endTime || startTime || '00:00');
    // Для фильтра: если конца нет — считаем до 23:59 дня окончания.
    var endForFilter = combineDateTime_(endIsoDate, endTime || '23:59');
    if (endForFilter < nowMoscow) {
      continue;
    }

    events.push({
      id: String(r),
      title: title,
      date: date,
      endDate: endDate && endDate !== date ? endDate : '',
      start: startTime,
      end: endTime,
      place: place,
      link: link,
      participants: participants,
      leader: leader,
      color: color,
      startIso: startIso,
      endIso: endIso
    });
  }

  events.sort(function (a, b) {
    if (a.startIso < b.startIso) return -1;
    if (a.startIso > b.startIso) return 1;
    return a.title.localeCompare(b.title, 'ru');
  });

  return events;
}

function getSpreadsheet_() {
  if (!SPREADSHEET_ID) {
    throw new Error('В Code.gs не задан SPREADSHEET_ID.');
  }
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  if (!ss) {
    throw new Error(
      'Не удалось открыть таблицу ' + SPREADSHEET_ID + '. Проверьте доступ скрипта к файлу.'
    );
  }
  return ss;
}

/** Проверка из редактора: Выполнить → testOpenSheet */
function testOpenSheet() {
  var events = getEvents();
  var sheet = getEventsSheet_();
  var msg =
    'OK: лист «' +
    sheet.getName() +
    '», событий: ' +
    events.length +
    ', таблица: ' +
    SPREADSHEET_ID;
  Logger.log(msg);
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch (e) {
    // В редакторе скрипта getUi() недоступен — смотрите журнал выполнения.
  }
  return msg;
}

function getEventsSheet_() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  if (!sheet) {
    throw new Error('В таблице нет ни одного листа.');
  }
  return sheet;
}

/**
 * Ищет строку заголовков.
 * Поддерживает:
 * 1) простой лист: заголовки в 1-й строке (date/title/...)
 * 2) дашборд: «Название мероприятия» не в первой строке; дата/время слева от названия
 */
function detectHeader_(values) {
  for (var r = 0; r < Math.min(values.length, 30); r++) {
    var map = buildHeaderMap_(values[r], false);
    if (map.title >= 0) {
      // Если даты в заголовках нет — берём 2 колонки левее названия (как в вашей таблице).
      if (map.date < 0 && map.title >= 2) {
        map.date = map.title - 2;
      }
      if (map.start < 0 && map.title >= 1) {
        map.start = map.title - 1;
      }
      if (map.date >= 0) {
        return { map: map, dataStart: r + 1 };
      }
    }
  }
  throw new Error(
    'Не найдены заголовки. Нужны колонки с датой и названием мероприятия.'
  );
}

function buildHeaderMap_(headerRow, requireDateTitle) {
  var normalized = {};
  for (var c = 0; c < headerRow.length; c++) {
    var key = String(headerRow[c] || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
    if (key) {
      normalized[key] = c;
    }
  }

  var map = {};
  Object.keys(HEADER_ALIASES).forEach(function (field) {
    var aliases = HEADER_ALIASES[field];
    map[field] = -1;
    for (var i = 0; i < aliases.length; i++) {
      var alias = aliases[i].toLowerCase();
      if (normalized.hasOwnProperty(alias)) {
        map[field] = normalized[alias];
        break;
      }
    }
  });

  if (requireDateTitle && (map.date < 0 || map.title < 0)) {
    throw new Error('В заголовках нужны дата и название.');
  }
  return map;
}

function cellString_(row, index) {
  if (index == null || index < 0 || index >= row.length) {
    return '';
  }
  var value = row[index];
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

/** Достаёт первую http(s)-ссылку из текста. */
function extractUrl_(text) {
  var m = String(text || '').match(/https?:\/\/[^\s<>"']+/i);
  if (!m) {
    return '';
  }
  return m[0].replace(/[.,);]+$/g, '');
}

function normalizeDate_(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  var text = String(value).trim();
  var iso = text.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (iso) {
    return iso[1] + '-' + pad2_(iso[2]) + '-' + pad2_(iso[3]);
  }
  var dmy = text.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (dmy) {
    return dmy[3] + '-' + pad2_(dmy[2]) + '-' + pad2_(dmy[1]);
  }
  return '';
}

function normalizeTime_(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  var text = String(value).trim();
  // «10:00», «10:00:00», иногда «10.00»
  var m = text.match(/^(\d{1,2})[:.](\d{2})/);
  if (m) {
    return pad2_(m[1]) + ':' + m[2];
  }
  return '';
}

function combineDateTime_(date, time) {
  // «Плавающее» время без Z/+offset: 19:00 в таблице = 19:00 на сайте.
  return date + 'T' + (time || '00:00') + ':00';
}

function pad2_(n) {
  var s = String(n);
  return s.length < 2 ? '0' + s : s;
}

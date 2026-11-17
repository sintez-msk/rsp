# Расписание синтез-деятельности

Исходники веб-расписания (Google Apps Script + Google Таблицаца).

## Ссылки

- **Таблица (редактирование):** https://docs.google.com/spreadsheets/d/1zdSZ-PkBbuHtGkHHaqgCSIHrF-50EJgoRftsVPVmd18/edit
- **Страница онлайн:** https://script.google.com/macros/s/AKfycbzk94NQdranm7yvLdDCLbFpnerv_eFC4LbAgJAJeo4b7wZwB0Dq4HqZEuhtkSSIPVyY/exec

## Как добавить мероприятие

На листе **События** добавьте строку:

`date | end_date | start | end | place | title | participants | leader | color`

Для онлайн-встречи в `place` укажите URL, например:

`Онлайн https://meet.google.com/xxx-xxxx-xxx`

Сохраните таблицу → обновите страницу (F5). Новый деплой не нужен.

Если меняли `apps-script/Code.gs` или `Index.html` — в Apps Script нужен деплой новой версии.

## Содержимое репозитория

| Путь | Назначение |
|------|------------|
| `apps-script/Code.gs` | Чтение таблицы, фильтр прошедших (Москва) |
| `apps-script/Index.html` | Календарь + список |
| `apps-script/appsscript.json` | Часовой пояс Europe/Moscow |

Репозиторий: https://github.com/sintez-msk/rsp

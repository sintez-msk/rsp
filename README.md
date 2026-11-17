# Расписание синтез-деятельности

Сайт на GitHub Pages читает события из Google Таблицы.

## Ссылки

- **Сайт (GitHub Pages):** https://sintez-msk.github.io/rsp/
- **Таблица:** https://docs.google.com/spreadsheets/d/1zdSZ-PkBbuHtGkHHaqgCSIHrF-50EJgoRftsVPVmd18/edit
- **Старый Apps Script (запасной):** https://script.google.com/macros/s/AKfycbzk94NQdranm7yvLdDCLbFpnerv_eFC4LbAgJAJeo4b7wZwB0Dq4HqZEuhtkSSIPVyY/exec

## Как править

Меняйте лист **События** в таблице → обновите сайт (F5). Деплой не нужен.

Таблица должна быть доступна как **«все, у кого есть ссылка — читатель»**.

## GitHub Pages

Settings → Pages → Branch `main`, folder **`/docs`** (предпочтительно) или `/ (root)`.

## Код

| Путь | Назначение |
|------|------------|
| `docs/index.html` | Календарь + список на Pages |
| `apps-script/` | Исходники Google Apps Script (бэкап) |

Репозиторий: https://github.com/sintez-msk/rsp

# Как запустить вишлист на своём сервере

Сайт — это один контейнер (страница + API + данные в файле) и Caddy, который сам получает HTTPS-сертификат.
Всё работает на одном недорогом VPS. Внешних сервисов (Vercel, Supabase, Google Fonts) нет, поэтому сайт
не зависит от их доступности в РФ.

## 1. Что понадобится

- **VPS в России** с Ubuntu 24.04: 1 vCPU, 1 ГБ памяти, 10 ГБ диска. Подойдёт любой хостер:
  Timeweb Cloud, Selectel, Yandex Cloud, REG.RU, Beget. Обычно это несколько сотен рублей в месяц.
- **Домен.** У тебя уже есть `proshutinskii.com`, удобно взять поддомен, например `wish.proshutinskii.com`.
- **Пароль** для своей версии, минимум 8 символов.

## 2. DNS

В панели, где управляешь доменом, добавь запись:

| Тип | Имя    | Значение       |
|-----|--------|----------------|
| A   | `wish` | IP твоего VPS |

Подожди, пока запись начнёт работать (обычно от нескольких минут до часа): `ping wish.proshutinskii.com`
должен показать IP сервера.

## 3. Установка на сервере

Подключись по SSH (`ssh root@IP`) и выполни:

```bash
# Docker из репозитория Ubuntu
apt update && apt install -y docker.io docker-compose-v2 git

# Код
git clone https://github.com/DmitriiProshutinskii/DmitriiProshutinskii.git /opt/wishlist
cd /opt/wishlist/wishlist/app

# Настройки: домен и пароль
cp .env.example .env
nano .env

# Сборка и запуск
docker compose up -d --build
```

Через минуту-две открой `https://wish.proshutinskii.com`, войди по паролю, нажми шестерёнку:
там название списка, твоё имя, параметры и **ссылка для друзей**.

Если на сервере включён файрвол, открой порты 80 и 443: `ufw allow 80,443/tcp`.

## 4. Обновление

```bash
cd /opt/wishlist && git pull && cd wishlist/app && docker compose up -d --build
```

Данные лежат в томе `wishlist_data` и при обновлении не трогаются.

## 5. Резервные копии

```bash
sh scripts/backup.sh          # архив в ./backups, хранятся последние 14
crontab -e                    # и добавить строку для ежедневной копии:
0 4 * * * cd /opt/wishlist/wishlist/app && sh scripts/backup.sh
```

Восстановление: `docker compose exec -T app tar -xzf - -C /data < backups/<файл>.tar.gz`, затем `docker compose restart app`.

## Если что-то не так

- **`docker compose up` не может скачать образы** (`node`, `caddy`). Иногда Docker Hub недоступен из РФ.
  Подключи зеркало: создай `/etc/docker/daemon.json` с содержимым
  `{"registry-mirrors": ["https://mirror.gcr.io"]}`, выполни `systemctl restart docker` и повтори.
  У многих российских хостеров есть своё зеркало Docker Hub, адрес обычно указан в их документации.
- **Сертификат не выдаётся.** Проверь, что A-запись указывает на этот сервер и порты 80/443 открыты.
  Логи: `docker compose logs caddy`.
- **Сайт не открывается.** `docker compose ps` и `docker compose logs app`.
- **Забыл пароль.** Поменяй `OWNER_PASSWORD` в `.env` и выполни `docker compose up -d`. Все входы сбросятся.
- **Ссылка для друзей утекла.** Шестерёнка → «Сменить ссылку». Старая перестанет работать, брони сохранятся.

## Что где хранится

- `db.json` — список, тематики, параметры, брони и отметки друзей.
- `uploads/` — фото желаний.

Брони и отметки друзей отдаются только по ссылке для друзей. API твоей версии их не возвращает
совсем, поэтому сюрприз не подсмотреть даже через инструменты разработчика.

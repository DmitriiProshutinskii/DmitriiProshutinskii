#!/bin/sh
# Архив данных (список, брони, фото) в ./backups, хранит последние 14.
# Запускать из папки с docker-compose.yml. Удобно повесить на cron раз в день:
#   0 4 * * * cd /opt/wishlist/wishlist/app && sh scripts/backup.sh
# Восстановление: docker compose exec -T app tar -xzf - -C /data < backups/<файл>.tar.gz
set -eu
mkdir -p backups
docker compose exec -T app tar -czf - -C /data . > "backups/wishlist-$(date +%Y%m%d-%H%M).tar.gz"
ls -1t backups/wishlist-*.tar.gz | tail -n +15 | xargs -r rm --

# Backup & restore runbook

Platform control plane: `kenji_platform` Postgres database plus per-tenant databases `kenji_tenant_{slug}`.

## Platform database

```bash
# Backup
pg_dump -h localhost -p 5437 -U kenji -d kenji_platform -Fc -f backups/kenji_platform_$(date +%Y%m%d).dump

# Restore (destructive — test on a clone first)
pg_restore -h localhost -p 5437 -U kenji -d kenji_platform --clean --if-exists backups/kenji_platform_YYYYMMDD.dump
```

## Tenant database (single operator)

```bash
SLUG=demo-operator
pg_dump -h localhost -p 5437 -U kenji -d kenji_tenant_${SLUG} -Fc -f backups/tenant_${SLUG}_$(date +%Y%m%d).dump
```

## All tenant databases

```bash
psql -h localhost -p 5437 -U kenji -d kenji_platform -tAc \
  "SELECT database_name FROM tenant_databases WHERE status = 'active'" | while read db; do
  pg_dump -h localhost -p 5437 -U kenji -d "$db" -Fc -f "backups/${db}_$(date +%Y%m%d).dump"
done
```

## Redis (optional)

BullMQ job state lives in Redis. For disaster recovery, platform jobs can be re-queued from the console (re-provision, migrate, DNS verify).

```bash
redis-cli -p 6383 SAVE
cp /var/lib/redis/dump.rdb backups/redis_$(date +%Y%m%d).rdb
```

## MinIO media

```bash
mc mirror local/kenji-raffle backups/minio/kenji-raffle
```

## Recovery order

1. Restore `kenji_platform`
2. Restore each tenant DB listed in `tenant_databases`
3. Restart API, worker, and platform console
4. Verify System page health and run test connection on a sample operator

# ER-диаграмма (модель данных)

## Назначение документа

Документ описывает модель данных EAM-системы: сущности, их атрибуты и связи. ER-диаграмма (`06a-er-diagram.png`) служит основой для проектирования схемы базы данных PostgreSQL и JPA-сущностей в Spring Boot.

Документ связан с:
- `02-functional-requirements.md` — требования к данным;
- `04-use-cases.md` — сценарии, использующие сущности;
- `05-entity-lifecycles.md` — статусы и переходы (поля `status`).

## Принятые решения

1. **Иерархия активов — только через локации.** Иерархия «предприятие → цех → участок → оборудование» реализуется через `locations.parent_location_id`, а активы привязаны к локациям.
2. **Полиморфные связи** используются в двух местах:
   - `comments` — комментарий может быть привязан либо к заявке (`request_id`), либо к наряду (`work_order_id`). Ограничение: ровно одно из двух полей не NULL.
   - `notifications` — уведомление может ссылаться на заявку или наряд через `related_entity_id` + `related_entity_type`.
3. **Статусы** хранятся как `VARCHAR(20)` с фиксированным набором значений (см. `05-entity-lifecycles.md`). На уровне БД можно добавить `CHECK`-ограничения.
4. **Аудит** ведётся в двух местах:
   - `asset_history` — история конкретного актива (видна в карточке).
   - `audit_log` — общий журнал всех действий (виден только Администратору).
5. **Вложения** (фото) хранятся в файловой системе, в БД — только метаданные (`file_path`, `file_size`, `content_type`).
6. **Мягкое удаление (Soft Delete)** используется для ключевых сущностей: `users`, `assets`, `requests`, `work_orders`, `spare_parts`, а также для вложений, задач наряда, запчастей в наряде и комментариев. Это сохраняет ссылочную целостность и историю. Поля: `is_deleted` (BOOLEAN, NOT NULL, default false), `deleted_at` (TIMESTAMP, NULL), `deleted_by` (BIGINT, FK → users, NULL).

## Сущности

### Справочники

#### users (Пользователи)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Логин |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt-хэш пароля |
| `last_name` | VARCHAR(100) | NOT NULL | Фамилия |
| `first_name` | VARCHAR(100) | NOT NULL | Имя |
| `middle_name` | VARCHAR(100) | NULL | Отчество (может отсутствовать) |
| `phone` | VARCHAR(20) | NULL | Телефон |
| `role` | VARCHAR(20) | NOT NULL | `ADMIN`, `MASTER`, `TECHNICIAN`, `REQUESTER` |
| `status` | VARCHAR(20) | NOT NULL | `ACTIVE`, `BLOCKED` |
| `is_deleted` | BOOLEAN | NOT NULL, default false | Флаг мягкого удаления |
| `deleted_at` | TIMESTAMP | NULL | Дата мягкого удаления |
| `deleted_by` | BIGINT | FK → users, NULL | Кто выполнил мягкое удаление |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |
| `updated_at` | TIMESTAMP | NOT NULL | Дата обновления |

#### asset_types (Типы оборудования)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Название типа |
| `description` | TEXT | NULL | Описание |

#### locations (Локации)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `name` | VARCHAR(255) | NOT NULL | Название (цех, участок, помещение) |
| `parent_location_id` | BIGINT | FK → locations, NULL | Родительская локация (иерархия) |
| `description` | TEXT | NULL | Описание |

#### spare_part_categories (Категории запчастей)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Название категории |

#### units (Единицы измерения)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | Название (шт, кг, м) |
| `short_name` | VARCHAR(10) | NOT NULL | Краткое обозначение |

### Основные сущности

#### assets (Активы / Оборудование)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `inventory_number` | VARCHAR(50) | UNIQUE, NOT NULL | Инвентарный номер |
| `name` | VARCHAR(255) | NOT NULL | Наименование |
| `asset_type_id` | BIGINT | FK → asset_types, NOT NULL | Тип оборудования |
| `model` | VARCHAR(255) | NULL | Модель |
| `serial_number` | VARCHAR(100) | NULL | Серийный номер |
| `commission_date` | DATE | NULL | Дата ввода в эксплуатацию |
| `location_id` | BIGINT | FK → locations, NOT NULL | Местоположение |
| `responsible_user_id` | BIGINT | FK → users, NULL | Ответственный сотрудник |
| `status` | VARCHAR(20) | NOT NULL | `ACTIVE`, `UNDER_REPAIR`, `INACTIVE`, `DECOMMISSIONED` |
| `is_deleted` | BOOLEAN | NOT NULL, default false | Флаг мягкого удаления |
| `deleted_at` | TIMESTAMP | NULL | Дата мягкого удаления |
| `deleted_by` | BIGINT | FK → users, NULL | Кто выполнил мягкое удаление |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |
| `updated_at` | TIMESTAMP | NOT NULL | Дата обновления |

#### requests (Заявки)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `asset_id` | BIGINT | FK → assets, NOT NULL | Оборудование |
| `author_id` | BIGINT | FK → users, NOT NULL | Автор заявки |
| `description` | TEXT | NOT NULL | Описание проблемы |
| `priority` | VARCHAR(20) | NOT NULL | `LOW`, `NORMAL`, `HIGH`, `CRITICAL` |
| `status` | VARCHAR(20) | NOT NULL | `NEW`, `ACCEPTED`, `IN_PROGRESS`, `CLOSED`, `REJECTED`, `CANCELLED` |
| `rejection_reason` | TEXT | NULL | Причина отклонения |
| `is_deleted` | BOOLEAN | NOT NULL, default false | Флаг мягкого удаления |
| `deleted_at` | TIMESTAMP | NULL | Дата мягкого удаления |
| `deleted_by` | BIGINT | FK → users, NULL | Кто выполнил мягкое удаление |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |
| `updated_at` | TIMESTAMP | NOT NULL | Дата обновления |

#### request_attachments (Вложения заявок)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `request_id` | BIGINT | FK → requests, NOT NULL | Заявка |
| `file_name` | VARCHAR(255) | NOT NULL | Имя файла |
| `file_path` | VARCHAR(500) | NOT NULL | Путь к файлу |
| `file_size` | BIGINT | NOT NULL | Размер в байтах |
| `content_type` | VARCHAR(100) | NOT NULL | MIME-тип |
| `is_deleted` | BOOLEAN | NOT NULL, default false | Флаг мягкого удаления |
| `deleted_at` | TIMESTAMP | NULL | Дата мягкого удаления |
| `deleted_by` | BIGINT | FK → users, NULL | Кто выполнил мягкое удаление |
| `created_at` | TIMESTAMP | NOT NULL | Дата загрузки |

#### work_orders (Наряды)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `request_id` | BIGINT | FK → requests, NULL | Заявка (NULL для наряда по ППР) |
| `asset_id` | BIGINT | FK → assets, NOT NULL | Оборудование |
| `master_id` | BIGINT | FK → users, NOT NULL | Мастер, создавший наряд |
| `technician_id` | BIGINT | FK → users, NULL | Исполнитель (механик) |
| `status` | VARCHAR(20) | NOT NULL | `DRAFT`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CLOSED`, `CANCELLED` |
| `planned_start_date` | DATE | NULL | Плановая дата начала |
| `planned_end_date` | DATE | NULL | Плановая дата окончания |
| `actual_start_date` | TIMESTAMP | NULL | Фактическая дата начала |
| `actual_end_date` | TIMESTAMP | NULL | Фактическая дата завершения |
| `cancel_reason` | TEXT | NULL | Причина отмены |
| `is_deleted` | BOOLEAN | NOT NULL, default false | Флаг мягкого удаления |
| `deleted_at` | TIMESTAMP | NULL | Дата мягкого удаления |
| `deleted_by` | BIGINT | FK → users, NULL | Кто выполнил мягкое удаление |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |
| `updated_at` | TIMESTAMP | NOT NULL | Дата обновления |

#### work_order_tasks (Работы в наряде)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `work_order_id` | BIGINT | FK → work_orders, NOT NULL | Наряд |
| `name` | VARCHAR(255) | NOT NULL | Наименование работы |
| `volume` | VARCHAR(100) | NULL | Объём |
| `is_completed` | BOOLEAN | NOT NULL, default false | Выполнена ли работа |
| `completed_at` | TIMESTAMP | NULL | Дата выполнения |
| `sort_order` | INT | NOT NULL | Порядок сортировки |
| `is_deleted` | BOOLEAN | NOT NULL, default false | Флаг мягкого удаления |
| `deleted_at` | TIMESTAMP | NULL | Дата мягкого удаления |
| `deleted_by` | BIGINT | FK → users, NULL | Кто выполнил мягкое удаление |

#### work_order_attachments (Вложения нарядов)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `work_order_id` | BIGINT | FK → work_orders, NOT NULL | Наряд |
| `file_name` | VARCHAR(255) | NOT NULL | Имя файла |
| `file_path` | VARCHAR(500) | NOT NULL | Путь к файлу |
| `file_size` | BIGINT | NOT NULL | Размер в байтах |
| `content_type` | VARCHAR(100) | NOT NULL | MIME-тип |
| `is_deleted` | BOOLEAN | NOT NULL, default false | Флаг мягкого удаления |
| `deleted_at` | TIMESTAMP | NULL | Дата мягкого удаления |
| `deleted_by` | BIGINT | FK → users, NULL | Кто выполнил мягкое удаление |
| `created_at` | TIMESTAMP | NOT NULL | Дата загрузки |

#### spare_parts (Запчасти)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `name` | VARCHAR(255) | NOT NULL | Наименование |
| `article` | VARCHAR(100) | NULL | Артикул |
| `category_id` | BIGINT | FK → spare_part_categories, NULL | Категория |
| `unit_id` | BIGINT | FK → units, NULL | Единица измерения |
| `stock_quantity` | INT | NOT NULL, default 0 | Остаток на складе |
| `status` | VARCHAR(20) | NOT NULL | `ACTIVE`, `ARCHIVED` |
| `is_deleted` | BOOLEAN | NOT NULL, default false | Флаг мягкого удаления |
| `deleted_at` | TIMESTAMP | NULL | Дата мягкого удаления |
| `deleted_by` | BIGINT | FK → users, NULL | Кто выполнил мягкое удаление |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |
| `updated_at` | TIMESTAMP | NOT NULL | Дата обновления |

#### work_order_spare_parts (Использование запчастей в нарядах)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `work_order_id` | BIGINT | FK → work_orders, NOT NULL | Наряд |
| `spare_part_id` | BIGINT | FK → spare_parts, NOT NULL | Запчасть |
| `planned_quantity` | INT | NULL | Запланированное количество |
| `actual_quantity` | INT | NULL | Фактически использованное количество |
| `is_planned` | BOOLEAN | NOT NULL, default true | Запланирована или фактическая |
| `is_deleted` | BOOLEAN | NOT NULL, default false | Флаг мягкого удаления |
| `deleted_at` | TIMESTAMP | NULL | Дата мягкого удаления |
| `deleted_by` | BIGINT | FK → users, NULL | Кто выполнил мягкое удаление |

### Вспомогательные сущности

#### comments (Комментарии)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `author_id` | BIGINT | FK → users, NOT NULL | Автор |
| `request_id` | BIGINT | FK → requests, NULL | Заявка (полиморфная) |
| `work_order_id` | BIGINT | FK → work_orders, NULL | Наряд (полиморфная) |
| `text` | TEXT | NOT NULL | Текст комментария |
| `is_deleted` | BOOLEAN | NOT NULL, default false | Флаг мягкого удаления |
| `deleted_at` | TIMESTAMP | NULL | Дата мягкого удаления |
| `deleted_by` | BIGINT | FK → users, NULL | Кто выполнил мягкое удаление |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |

**Ограничение:** ровно одно из полей `request_id` или `work_order_id` должно быть NOT NULL (проверка на уровне БД через `CHECK`).

#### asset_history (История актива)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `asset_id` | BIGINT | FK → assets, NOT NULL | Актив |
| `event_type` | VARCHAR(50) | NOT NULL | `CREATED`, `STATUS_CHANGED`, `REPAIR`, `MOVED`, `COMMENT` |
| `description` | TEXT | NULL | Описание события |
| `old_value` | VARCHAR(255) | NULL | Старое значение |
| `new_value` | VARCHAR(255) | NULL | Новое значение |
| `user_id` | BIGINT | FK → users, NULL | Кто выполнил |
| `work_order_id` | BIGINT | FK → work_orders, NULL | Связанный наряд (если ремонт) |
| `created_at` | TIMESTAMP | NOT NULL | Дата события |

#### notifications (Уведомления)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `user_id` | BIGINT | FK → users, NOT NULL | Получатель |
| `type` | VARCHAR(50) | NOT NULL | `REQUEST_CREATED`, `REQUEST_STATUS_CHANGED`, `WORK_ORDER_ASSIGNED`, `WORK_ORDER_COMPLETED`, `WORK_ORDER_CLOSED` |
| `message` | TEXT | NOT NULL | Текст уведомления |
| `is_read` | BOOLEAN | NOT NULL, default false | Прочитано ли |
| `related_entity_id` | BIGINT | NULL | ID связанной сущности (полиморфная) |
| `related_entity_type` | VARCHAR(50) | NULL | `REQUEST`, `WORK_ORDER` (полиморфная) |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |

#### audit_log (Журнал аудита)

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| `id` | BIGINT | PK, auto | Идентификатор |
| `user_id` | BIGINT | FK → users, NULL | Кто выполнил (NULL для системных действий) |
| `action` | VARCHAR(50) | NOT NULL | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT` |
| `entity_type` | VARCHAR(50) | NOT NULL | Тип сущности (`ASSET`, `REQUEST`, `WORK_ORDER`, `USER` и т.д.) |
| `entity_id` | BIGINT | NULL | ID сущности |
| `details` | TEXT | NULL | Детали (JSON с изменениями) |
| `ip_address` | VARCHAR(45) | NULL | IP-адрес |
| `created_at` | TIMESTAMP | NOT NULL | Дата события |

## Связи между сущностями

| Связь | Тип | Описание |
|---|---|---|
| `users` → `requests` | 1:N | Один пользователь — много заявок (как автор) |
| `users` → `work_orders` (master) | 1:N | Один мастер — много нарядов (как создатель) |
| `users` → `work_orders` (technician) | 1:N | Один механик — много нарядов (как исполнитель) |
| `users` → `comments` | 1:N | Один пользователь — много комментариев |
| `users` → `notifications` | 1:N | Один пользователь — много уведомлений |
| `users` → `audit_log` | 1:N | Один пользователь — много записей аудита |
| `users` → `assets` | 1:N | Один пользователь — много ответственных активов |
| `asset_types` → `assets` | 1:N | Один тип — много активов |
| `locations` → `assets` | 1:N | Одна локация — много активов |
| `locations` → `locations` | 1:N | Иерархия локаций (родитель — дети) |
| `assets` → `requests` | 1:N | Один актив — много заявок |
| `assets` → `work_orders` | 1:N | Один актив — много нарядов |
| `assets` → `asset_history` | 1:N | Один актив — много записей истории |
| `requests` → `request_attachments` | 1:N | Одна заявка — много вложений |
| `requests` → `work_orders` | 1:0..1 | Одна заявка — максимум один наряд |
| `requests` → `comments` | 1:N | Одна заявка — много комментариев |
| `work_orders` → `work_order_tasks` | 1:N | Один наряд — много работ |
| `work_orders` → `work_order_spare_parts` | 1:N | Один наряд — много запчастей |
| `work_orders` → `work_order_attachments` | 1:N | Один наряд — много вложений |
| `work_orders` → `comments` | 1:N | Один наряд — много комментариев |
| `spare_part_categories` → `spare_parts` | 1:N | Одна категория — много запчастей |
| `units` → `spare_parts` | 1:N | Одна единица — много запчастей |
| `spare_parts` → `work_order_spare_parts` | 1:N | Одна запчасть — много использований |
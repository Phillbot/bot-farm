-- Создание схемы players

drop SCHEMA if EXISTS players CASCADE;

CREATE SCHEMA players;

-- Создание таблицы user_statuses в схеме players
CREATE TABLE players.user_statuses (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

-- Вставка статусов
INSERT INTO
    players.user_statuses (status_name)
VALUES ('active'),
    ('blocked'),
    ('banned');

-- Создание таблицы abilities в схеме players
CREATE TABLE players.abilities (
    ability_id SERIAL PRIMARY KEY,
    ability_name VARCHAR(50) NOT NULL
);

-- Вставка способностей
INSERT INTO
    players.abilities (ability_name)
VALUES ('click_coast_level'),
    ('energy_level'),
    ('energy_regeniration_level');

-- Создание таблицы users в схеме players
CREATE TABLE players.users (
    user_id BIGINT PRIMARY KEY,
    reg_data BIGINT NOT NULL, -- Изменение на BIGINT для хранения времени в миллисекундах
    referral_id BIGINT,
    user_name VARCHAR(50),
    first_name VARCHAR(50),
    user_status INTEGER REFERENCES players.user_statuses (status_id),
    balance INTEGER DEFAULT 0 -- Добавляем поле balance
);

-- Создание таблицы user_abilities в схеме players
CREATE TABLE players.user_abilities (
    user_id BIGINT REFERENCES players.users (user_id),
    click_coast_level INTEGER DEFAULT 1,
    energy_level INTEGER DEFAULT 1,
    energy_regeniration_level INTEGER DEFAULT 1,
    PRIMARY KEY (user_id)
);

-- Создание таблицы referrals для отслеживания рефералов
CREATE TABLE players.referrals (
    user_id BIGINT REFERENCES players.users (user_id),
    referred_user_id BIGINT REFERENCES players.users (user_id),
    PRIMARY KEY (user_id, referred_user_id)
);

-- Создание таблицы active_energy_by_user в схеме players
CREATE TABLE players.active_energy_by_user (
    user_id BIGINT PRIMARY KEY,
    active_energy INTEGER DEFAULT 1000,
    FOREIGN KEY (user_id) REFERENCES players.users (user_id) ON DELETE CASCADE
);

-- Создание таблицы last_sessions в схеме players
CREATE TABLE players.last_sessions (
    user_id BIGINT PRIMARY KEY REFERENCES players.users (user_id),
    last_login BIGINT, -- Изменение на BIGINT для хранения времени в миллисекундах
    last_logout BIGINT -- Изменение на BIGINT для хранения времени в миллисекундах
);

-- Создание функции для вставки начальных данных в user_abilities в схеме players
CREATE OR REPLACE FUNCTION players.add_default_abilities() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO players.user_abilities (user_id, click_coast_level, energy_level, energy_regeniration_level)
    VALUES (NEW.user_id, 1, 1, 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для вызова функции после вставки в таблицу users в схеме players
CREATE TRIGGER after_insert_user AFTER
INSERT
    ON players.users FOR EACH ROW
EXECUTE FUNCTION players.add_default_abilities ();

-- Создание функции для вставки начальных данных в active_energy_by_user в схеме players
CREATE OR REPLACE FUNCTION players.add_default_active_energy() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO players.active_energy_by_user (user_id, active_energy)
    VALUES (NEW.user_id, 1000);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для вызова функции после вставки в таблицу users в схеме players
CREATE TRIGGER after_insert_user_active_energy AFTER
INSERT
    ON players.users FOR EACH ROW
EXECUTE FUNCTION players.add_default_active_energy ();

-- Создание функции для вставки начальных данных в last_sessions в схеме players
CREATE OR REPLACE FUNCTION players.add_default_last_sessions() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO players.last_sessions (user_id, last_login)
    VALUES (NEW.user_id, EXTRACT(EPOCH FROM NOW()) * 1000);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для вызова функции после вставки в таблицу users в схеме players
CREATE TRIGGER after_insert_user_last_sessions AFTER
INSERT
    ON players.users FOR EACH ROW
EXECUTE FUNCTION players.add_default_last_sessions ();

-- Пример вставки нового пользователя
INSERT INTO
    players.users (
        user_id,
        reg_data,
        referral_id,
        user_name,
        first_name,
        user_status
    )
VALUES (
        123456789,
        EXTRACT(
            EPOCH
            FROM NOW()
        ) * 1000,
        NULL,
        'username',
        'FirstName',
        1
    );

CREATE TABLE players.boosts (
    user_id BIGINT PRIMARY KEY,
    last_boost_run BIGINT NOT NULL
);

ALTER TABLE players.referrals
ADD COLUMN reward_claim BOOLEAN DEFAULT FALSE;

-- Проверка вставки
SELECT * FROM players.users;

SELECT * FROM players.user_abilities;

SELECT * FROM players.active_energy_by_user;

SELECT * FROM players.last_sessions;

SELECT * FROM players.referrals;

select * from players.boosts;

update players.users
set
    balance = 1000000
where
    user_id = '352588651';

update players.referrals
set
    reward_claim = false
where
    referred_user_id = '438397447';

update players.active_energy_by_user
set
    active_energy = 1000
where
    user_id = '314593415';

UPDATE players.user_abilities
SET
    click_coast_level = 1,
    energy_level = 1,
    energy_regeniration_level = 1
WHERE
    user_id = '314593415';

delete from players.boosts where user_id = '314593415';

-- Удаление пользователя и связанных записей
DELETE FROM players.user_abilities WHERE user_id = '314593415';

DELETE FROM players.referrals
WHERE
    user_id = '314593415'
    OR referred_user_id = '314593415';

DELETE FROM players.active_energy_by_user
WHERE
    user_id = '314593415';

DELETE FROM players.last_sessions WHERE user_id = '314593415';

DELETE FROM players.users WHERE user_id = '314593415';
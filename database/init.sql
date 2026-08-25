CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username)
);

CREATE TABLE IF NOT EXISTS login_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    submitted_password VARCHAR(255) NOT NULL,
    login_time DATETIME NOT NULL,
    ip_address VARCHAR(64) NOT NULL,

    PRIMARY KEY (id),
    INDEX idx_login_time (login_time),
    INDEX idx_login_username (username)
);

CREATE TABLE IF NOT EXISTS simulation_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    training_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_training_id (training_id),
    INDEX idx_created_at (created_at)
);
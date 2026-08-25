CREATE TABLE IF NOT EXISTS simulation_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    training_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_training_id (training_id),
    INDEX idx_created_at (created_at)
);
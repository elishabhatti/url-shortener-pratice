CREATE TABLE `shortlink` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`url` varchar(2000) NOT NULL,
	`shortCode` varchar(255) NOT NULL,
	CONSTRAINT `shortlink_id` PRIMARY KEY(`id`),
	CONSTRAINT `shortlink_shortCode_unique` UNIQUE(`shortCode`)
);

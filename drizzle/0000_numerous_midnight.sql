CREATE TABLE `short_link` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`url` varchar(2000) NOT NULL,
	`shortCode` varchar(255) NOT NULL,
	CONSTRAINT `short_link_id` PRIMARY KEY(`id`),
	CONSTRAINT `short_link_shortCode_unique` UNIQUE(`shortCode`)
);

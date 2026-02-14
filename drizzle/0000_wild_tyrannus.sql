CREATE TABLE `boxes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT '2026-02-13T23:42:29.000Z' NOT NULL,
	`updated_at` text DEFAULT '2026-02-13T23:42:29.001Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`box_id` integer,
	`expiration_date` text,
	`unit_measure` text,
	`status` text,
	`image` text,
	`created_at` text DEFAULT '2026-02-13T23:42:29.002Z' NOT NULL,
	`updated_at` text DEFAULT '2026-02-13T23:42:29.002Z' NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`box_id`) REFERENCES `boxes`(`id`) ON UPDATE no action ON DELETE no action
);

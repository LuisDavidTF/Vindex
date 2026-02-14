PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_boxes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT '2026-02-13T23:42:46.182Z' NOT NULL,
	`updated_at` text DEFAULT '2026-02-13T23:42:46.184Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_boxes`("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM `boxes`;--> statement-breakpoint
DROP TABLE `boxes`;--> statement-breakpoint
ALTER TABLE `__new_boxes` RENAME TO `boxes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`box_id` integer,
	`expiration_date` text,
	`unit_measure` text,
	`status` text,
	`image` text,
	`created_at` text DEFAULT '2026-02-13T23:42:46.185Z' NOT NULL,
	`updated_at` text DEFAULT '2026-02-13T23:42:46.185Z' NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`box_id`) REFERENCES `boxes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "name", "quantity", "box_id", "expiration_date", "unit_measure", "status", "image", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "quantity", "box_id", "expiration_date", "unit_measure", "status", "image", "created_at", "updated_at", "deleted_at" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;
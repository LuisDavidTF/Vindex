PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto` text NOT NULL,
	`stock_actual` integer DEFAULT 0 NOT NULL,
	`box_id` integer,
	`marca` text,
	`linea` text,
	`fecha_caducidad` text,
	`unidad_medida` text,
	`estado` text,
	`cantidad_inicial` integer DEFAULT 0 NOT NULL,
	`cantidad_vendida` integer DEFAULT 0 NOT NULL,
	`fecha_venta` text,
	`image` text,
	`custom_fields` text,
	`created_at` text DEFAULT '2026-06-07T00:00:00.000Z' NOT NULL,
	`updated_at` text DEFAULT '2026-06-07T00:00:00.000Z' NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`box_id`) REFERENCES `boxes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "producto", "stock_actual", "box_id", "marca", "linea", "fecha_caducidad", "unidad_medida", "estado", "cantidad_inicial", "cantidad_vendida", "fecha_venta", "image", "custom_fields", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "quantity", "box_id", "brand", "category", "expiration_date", "unit_measure", "status", "initial_quantity", "sold_quantity", "sale_date", "image", "custom_fields", "created_at", "updated_at", "deleted_at" FROM `products`;
--> statement-breakpoint
DROP TABLE `products`;
--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;

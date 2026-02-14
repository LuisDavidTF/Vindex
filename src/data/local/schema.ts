import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const boxes = sqliteTable('boxes', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

export const products = sqliteTable('products', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull().default(0),
  boxId: integer('box_id').references(() => boxes.id),
  brand: text('brand'), // e.g., 'Natura', 'Avon'
  category: text('category'), // e.g., 'Perfumes', 'Cuerpo'
  expirationDate: text('expiration_date'), // ISO 8601
  unitMeasure: text('unit_measure'),
  status: text('status'), // 'active', 'consumed', 'discarded' ?
  image: text('image'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
  deletedAt: text('deleted_at'),
});

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const boxes = sqliteTable('boxes', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

export const products = sqliteTable('products', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  producto: text('producto').notNull(),
  stockActual: integer('stock_actual').notNull().default(0),
  boxId: integer('box_id').references(() => boxes.id),
  marca: text('marca'),
  linea: text('linea'),
  fechaCaducidad: text('fecha_caducidad'),
  unidadMedida: text('unidad_medida'),
  estado: text('estado'),
  cantidadInicial: integer('cantidad_inicial').notNull().default(0),
  cantidadVendida: integer('cantidad_vendida').notNull().default(0),
  fechaVenta: text('fecha_venta'),
  image: text('image'),
  customFields: text('custom_fields'), // JSON string parsed manually in repository
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
  deletedAt: text('deleted_at'),
});

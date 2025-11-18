/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up= (pgm) => {
    console.log("Rodando migração UP: Adicionando coluna 'ativo' faltante em 'usuarios'...");

  pgm.addColumns("usuarios", {
    ativo: { type: "boolean", notNull: true, default: true },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    console.log("Rodando migração DOWN: Removendo coluna 'ativo' de 'usuarios'...");

  pgm.dropColumns("usuarios", ["ativo"]);
};

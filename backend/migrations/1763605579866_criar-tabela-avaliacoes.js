/* eslint-disable camelcase */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  console.log("Rodando migração UP: criando tabela 'avaliacoes'...");

  // 3. Tabela para a "CAPA" do relatório (Quem, Onde, Quando)
  pgm.createTable("avaliacoes", {
    id: "id",
    farmacia_id: {
      type: "integer",
      notNull: true,
      references: '"farmacias"(id)', // Depende da tabela 'farmacias'
    },
    avaliador_id: {
      type: "integer",
      notNull: true,
      references: '"usuarios"(id)', // Depende da tabela 'usuarios'
    },
    data_avaliacao: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    observacoes_gerais: { type: "text" },
    pontuacao_final: { type: "decimal(5, 2)" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  console.log("Rodando migração DOWN: removendo 'avaliacoes'...");
  pgm.dropTable("avaliacoes");
};

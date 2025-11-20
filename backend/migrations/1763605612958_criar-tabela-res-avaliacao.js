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
  console.log("Rodando migração UP: criando tabela 'respostas_avaliacao'...");

  // Tabela para as RESPOSTAS de cada pergunta
  pgm.createTable("respostas_avaliacao", {
    id: "id",
    avaliacao_id: {
      type: "integer",
      notNull: true,
      references: '"avaliacoes"(id)', // Depende da tabela 'avaliacoes'
      onDelete: "CASCADE", // Se apagar a avaliação, apaga as respostas
    },
    item_id: {
      type: "integer",
      notNull: true,
      references: '"itens_avaliacao"(id)', // Depende da tabela 'itens_avaliacao'
    },
    resposta_valor: { type: "varchar(255)", notNull: true },

    pontos: { type: "integer", notNull: true },

    observacao_item: { type: "text" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  console.log("Rodando migração DOWN: removendo 'respostas_avaliacao'...");
  pgm.dropTable("respostas_avaliacao");
};

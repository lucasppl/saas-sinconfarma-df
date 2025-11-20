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
  console.log("Rodando migração UP: criando tabela 'categorias_avaliacao' e povoando...");

  // 1. Tabela para os CATEGORIAS de avaliação (ex: "Letreiro/Marquise", "Gôndolas")
  pgm.createTable("categorias_avaliacao", {
    id: "id",
    nome_categoria: { type: "varchar(100)", notNull: true },
    ordem: { type: "integer", notNull: true },
  });

  // POVOAR (Seeding): Insere as 6 categorias de avaliação que serão referenciadas
  // *** CORRIGIDO: O INSERT usa nome_categoria ***
  pgm.sql(`
    INSERT INTO "categorias_avaliacao" (nome_categoria, ordem) VALUES
    ('Letreiro/Marquise', 1),
    ('Loja (Geral)', 2),
    ('Gôndolas', 3),
    ('Colaboradores Balcão', 4),
    ('Colaboradores Salão', 5),
    ('Colaboradores Caixa', 6);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  console.log("Rodando migração DOWN: removendo 'categorias_avaliacao'...");
  pgm.dropTable("categorias_avaliacao");
};

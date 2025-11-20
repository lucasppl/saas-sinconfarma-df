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
    console.log("Rodando migração UP: criando 'farmacias' (VERSÃO ORIGINAL)...");

    // Versão Original da Tabela
    pgm.createTable("farmacias", {
        id: "id",
        nome: { type: "varchar(100)", notNull: true },
        endereco: { type: "varchar(255)", notNull: true },
        telefone: { type: "varchar(20)", notNull: true, unique: true },
        cnpj: { type: "varchar(14)", notNull: true, unique: true },
        criado_em: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        atualizado_em: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });

    // POVOAMENTO ORIGINAL
    pgm.sql(`
        INSERT INTO farmacias (nome, endereco, telefone, cnpj)
        VALUES
            ('Farmácia Central', 'Rua Principal, 123', '(61) 91234-5678', '12345678000190'),
            ('Drogaria Saúde', 'Avenida Secundária, 456', '(61) 98765-4321', '09876543000180');
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    console.log("Rodando migração DOWN: removendo 'farmacias'...");
    pgm.dropTable("farmacias");
};

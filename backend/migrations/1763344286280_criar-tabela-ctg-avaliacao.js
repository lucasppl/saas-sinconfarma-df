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
    console.log('Rodabo migração UP: criando tabela categoria avaliacao');

    pgm.createTable('categoria_avaliacao', {
        id: "id",
        nome: {type: 'varchar(100)', notNull: true},
        descricao: {type: 'text'},
        ordem: {type: 'integer'},
    });

    pgm.sql(`
        INSERT INTO "categoria_avaliacao" (nome, ordem) VALUES
        ('Atendimento da Loja', 1),
        ('Gôndolas', 2),
        ('Atendimento', 3);
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    console.log("Rodando migração DOWN: removendo tabela categoria avaliacao...");
    pgm.dropTable('categoria_avaliacao');
};

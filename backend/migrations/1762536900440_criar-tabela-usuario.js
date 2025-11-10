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
  console.log("Rodando migração UP: criando 'roles' e 'usuarios'...");

  // CRIAR A TABELA 'roles'
  // Usamos 'pgm.createTable' porque é um comando de ESTRUTURA (DDL).
  // A ferramenta usa isso para saber como reverter (down) automaticamente.
  pgm.createTable("roles", {
    id: "id", // Atalho para 'SERIAL PRIMARY KEY'
    nome: { type: "varchar(50)", notNull: true, unique: true },
  });

  // CRIAR A TABELA 'usuarios'
  pgm.createTable("usuarios", {
    id: "id",
    nome: { type: "varchar(100)", notNull: true },
    email: { type: "varchar(100)", notNull: true, unique: true },
    senha_hash: { type: "varchar(255)", notNull: true },

    // CHAVE ESTRANGEIRA
    // 'references' diz: "O valor aqui DEVE existir na coluna 'id' da tabela 'roles'"
    role_id: {
      type: "integer",
      notNull: true,
      references: '"roles"(id)', // As aspas duplas em "roles" são por segurança
      onDelete: "RESTRICT", // Impede apagar uma 'role' se um usuário a estiver usando
    },
  });

  // Adicionar Timestamps
  // Usamos 'pgm.addColumns' (outro comando de ESTRUTURA)
  pgm.addColumns("usuarios", {
    criado_em: {
      type: "timestamp",
      notNull: true,
      // 'pgm.func()' é como 'current_timestamp' do PostgreSQL,
      // não o TEXTO 'current_timestamp'"
      default: pgm.func("current_timestamp"),
    },
    atualizado_em: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // SEMEAR O BANCO (Seeding)
  // Usamos 'pgm.sql()' porque 'INSERT' é um comando de DADOS (DML),
  // e a ferramenta não tem um assistente (como 'pgm.insert()') para isso.
  //
  // Usamos as crases (`) porque elas são 'Template Literals' do JavaScript.
  // Elas permitem escrever strings com MÚLTIPLAS LINHAS,
  // o que torna o SQL muito mais limpo e legível.
  pgm.sql(`
    INSERT INTO "roles" (nome) VALUES
    ('admin'),
    ('farmaceutico'),
    ('cliente');
  `);

  pgm.sql(`
    INSERT INTO "usuarios" (nome, email, senha_hash, role_id) VALUES
    ('Gabriel', 'teste01@gmail.com', 'hash_da_senha_01', 1),
    ('Ana Clara', 'teste2@gmail.com', 'hash_da_senha_02', 2);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  console.log("Rodando migração DOWN: removendo 'roles' e 'usuarios'...");

  // A ORDEM DO 'DOWN' DEVE SER O INVERSO EXATO DO 'UP'
  // Apagar 'usuarios' PRIMEIRO (pois ela referencia 'roles')
  pgm.dropTable("usuarios");

  // Apagar 'roles' DEPOIS
  pgm.dropTable("roles");
};

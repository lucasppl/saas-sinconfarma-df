/* eslint-disable camelcase */
import bcrypt from "bcryptjs"; // 1. Importar a biblioteca

export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = async (pgm) => {
  // 2. Transformar em async
  console.log("Rodando migração UP: criando 'roles' e 'usuarios'...");

  // --- CRIAÇÃO DAS TABELAS ---

  pgm.createTable("roles", {
    id: "id",
    nome: { type: "varchar(50)", notNull: true, unique: true },
  });

  pgm.createTable("usuarios", {
    id: "id",
    nome: { type: "varchar(100)", notNull: true },
    email: { type: "varchar(100)", notNull: true, unique: true },
    senha_hash: { type: "varchar(255)", notNull: true },
    role_id: {
      type: "integer",
      notNull: true,
      references: '"roles"(id)',
      onDelete: "RESTRICT",
    },
  });

  pgm.addColumns("usuarios", {
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

  // --- INSERÇÃO DE DADOS (SEEDING) ---

  pgm.sql(`
    INSERT INTO "roles" (nome) VALUES
    ('admin'),
    ('cliente');
  `);

  // 3. GERAR O HASH DA SENHA
  // Aqui definimos que a senha será '123456'. Você pode mudar se quiser.
  const senhaPadrao = "123456";
  const hash = await bcrypt.hash(senhaPadrao, 10);

  // 4. INSERIR O USUÁRIO ERIVAN
  // A variável ${hash} agora contém a senha criptografada
  pgm.sql(`
    INSERT INTO "usuarios" (nome, email, senha_hash, role_id) VALUES
    ('Erivan', 'erivan@gmail.com', '${hash}', 1);
  `);
};

export const down = (pgm) => {
  console.log("Rodando migração DOWN: removendo 'roles' e 'usuarios'...");
  pgm.dropTable("usuarios");
  pgm.dropTable("roles");
};

// /backend/migrations/..._ajustar-roles.js

// ... (export const shorthands ... ) ...

export const up = (pgm) => {
  console.log("Rodando migração UP: Ajustando roles para Admin/Avaliador (v2 - CORRETA)...");

  pgm.sql("INSERT INTO roles (nome) VALUES ('avaliador');");

  const avaliadorRoleId = "(SELECT id FROM roles WHERE nome = 'avaliador')";
  const farmaceuticoRoleId = "(SELECT id FROM roles WHERE nome = 'farmaceutico')";
  const clienteRoleId = "(SELECT id FROM roles WHERE nome = 'cliente')";

  pgm.sql(`
    UPDATE usuarios
    SET role_id = ${avaliadorRoleId}
    WHERE role_id = ${farmaceuticoRoleId};
  `);

  pgm.sql(`
    UPDATE usuarios
    SET role_id = ${avaliadorRoleId}
    WHERE role_id = ${clienteRoleId};
  `);

  pgm.sql("DELETE FROM roles WHERE nome = 'farmaceutico';");
  pgm.sql("DELETE FROM roles WHERE nome = 'cliente';");
};

export const down = (pgm) => {
  console.log("Rodando migração DOWN: Revertendo para Admin/Farm/Cliente");
  pgm.sql("INSERT INTO roles (nome) VALUES ('farmaceutico'), ('cliente');");
  pgm.sql("DELETE FROM roles WHERE nome = 'avaliador';");
};

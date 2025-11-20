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
    console.log('Rodando migração UP: adicionando campos de app');

    pgm.addColumn('usuarios', {
        url_avatar: {type: 'text'},
<<<<<<< HEAD
        telefone: {type: 'varchar(20)'}
=======
        telefone: {type: 'varchar(20)'},
>>>>>>> 46265812508483d93b82d53495c5bc7b5f7d9f4a
    });

    pgm.addColumns('farmacias', {
        url_logo: {type: 'text'},
        horario_funcionamento: {type: 'varchar(100)'},
        nota_media: {type: 'decimal(3,1)', default: 0.0},
        latitude: {type: 'numeric(10,8)'}, // mapa
        longitude: {type: 'numeric(11,8)'}, // mapa
    });
};


/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down= (pgm) => {
    console.log("Rodando migração DOWN: removendo campos do app...");

  // Ordem inversa
  pgm.dropColumns("farmacias", [
    "url_logo",
    "horario_funcionamento",
    "nota_media",
    "latitude",
    "longitude",
  ]);

  pgm.dropColumns("usuarios", [
    "url_avatar",
    "telefone",
  ]);
};

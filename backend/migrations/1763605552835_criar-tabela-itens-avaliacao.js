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
  console.log("Rodando migração UP: criando tabela 'itens_avaliacao' com 19 perguntas...");

  // 2. Tabela para as PERGUNTAS de cada tópico
  pgm.createTable("itens_avaliacao", {
    id: "id",
    categoria_id: {
      type: "integer",
      notNull: true,
      // Garante que o ID da categoria existe na tabela 'categorias_avaliacao'
      references: '"categorias_avaliacao"(id)',
    },
    texto_pergunta: { type: "text", notNull: true },
    // O tipo de resposta é sempre 'emoji_3_opcoes' para as 19 perguntas
    tipo_resposta: { type: "varchar(50)", notNull: true },
    // Peso para o cálculo (default 1)
    peso: { type: "integer", default: 1 },
  });

  // POVOAR (Seeding): Insere as 19 perguntas, ligadas às 6 categorias por ID.
  pgm.sql(`
    INSERT INTO "itens_avaliacao" (categoria_id, texto_pergunta, tipo_resposta) VALUES

    -- 1. Letreiro/Marquise (ID 1)
    (1, 'Apresentação do Letreiro/Marquise', 'emoji_3_opcoes'),
    (1, 'Manutenção do Letreiro/Marquise', 'emoji_3_opcoes'),
    (1, 'Iluminação do Letreiro/Marquise', 'emoji_3_opcoes'),

    -- 2. Loja (Geral) (ID 2)
    (2, 'Limpeza geral da Loja', 'emoji_3_opcoes'),
    (2, 'Iluminação interna da Loja', 'emoji_3_opcoes'),
    (2, 'Layout e Organização da Loja', 'emoji_3_opcoes'),
    (2, 'Comunicação Visual (cartazes, ofertas)', 'emoji_3_opcoes'),

    -- 3. Gôndolas (ID 3)
    (3, 'Limpeza das Gôndolas e Prateleiras', 'emoji_3_opcoes'),
    (3, 'Precificação (Organização e Acuracidade)', 'emoji_3_opcoes'),
    (3, 'Rupturas (Falta de produtos)', 'emoji_3_opcoes'),

    -- 4. Colaboradores Balcão (ID 4)
    (4, 'Apresentação e Uniforme', 'emoji_3_opcoes'),
    (4, 'Atenção e Proatividade', 'emoji_3_opcoes'),
    (4, 'Conhecimento Técnico', 'emoji_3_opcoes'),

    -- 5. Colaboradores Salão (ID 5)
    (5, 'Apresentação e Uniforme', 'emoji_3_opcoes'),
    (5, 'Atenção e Proatividade', 'emoji_3_opcoes'),
    (5, 'Conhecimento sobre Produtos/Localização', 'emoji_3_opcoes'),

    -- 6. Colaboradores Caixa (ID 6)
    (6, 'Apresentação e Uniforme', 'emoji_3_opcoes'),
    (6, 'Atenção e Agilidade', 'emoji_3_opcoes'),
    (6, 'Conhecimento do Sistema/Procedimentos', 'emoji_3_opcoes');
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  console.log("Rodando migração DOWN: removendo 'itens_avaliacao'...");
  pgm.dropTable("itens_avaliacao");
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = 'nbu_exchange';
    const tableName = 'bot_subscribers';

    await queryInterface.sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);

    await queryInterface.createTable(
      { schema, tableName },
      {
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        user_name: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        is_subscribe_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        lang: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
      },
      {
        schema,
      },
    );
  },

  async down(queryInterface) {
    const schema = 'nbu_exchange';
    const tableName = 'bot_subscribers';

    await queryInterface.dropTable({ schema, tableName });
    await queryInterface.sequelize.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`);
  },
};

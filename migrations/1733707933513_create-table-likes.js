/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    owner: {
      type: 'varchar(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    comment: {
      type: 'varchar(50)',
      notNull: true,
      references: '"comments"',
      onDelete: 'CASCADE',
    },
    is_liked: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};

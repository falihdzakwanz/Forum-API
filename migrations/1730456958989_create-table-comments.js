/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    content: {
      type: 'text',
      notNull: true,
    },
    owner: {
      type: 'varchar(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    thread_id: {
      type: 'varchar(50)',
      notNull: true,
      references: '"threads"',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    is_deleted: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};

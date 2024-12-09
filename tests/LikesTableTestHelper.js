/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    id = 'like-123',
    owner = 'user-456',
    comment = 'comment-245',
    is_liked = true,
  }) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3, $4)',
      values: [id, owner, comment, is_liked],
    };

    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM likes WHERE id = $1',
      values: [id],
    };

    const { rows } = await pool.query(query);
    return rows;
  },

  async findLikesByCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment = $1',
      values: [commentId],
    };

    const { rows } = await pool.query(query);
    return rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;

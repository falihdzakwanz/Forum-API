const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async toggleCommentLike(userId, commentId) {
    const selectLikes = {
      text: 'SELECT id, is_liked FROM likes WHERE owner = $1 AND comment = $2',
      values: [userId, commentId],
    };
    const { rows } = await this._pool.query(selectLikes);

    let setLikes = {};

    if (rows.length < 1) {
      const id = `like-${this._idGenerator()}`;

      setLikes = {
        text: 'INSERT INTO likes VALUES($1, $2, $3, $4)',
        values: [id, userId, commentId, true],
      };
    } else {
      const { id, is_liked } = rows[0];

      setLikes = {
        text: 'UPDATE likes SET is_liked = NOT $1 WHERE id = $2',
        values: [is_liked, id],
      };
    }

    await this._pool.query(setLikes);
  }

  async countCommentLikes(commentId) {
    const query = {
      text: `SELECT CAST(COUNT(id) AS int) AS likes_count
           FROM likes
           WHERE comment = $1
           AND is_liked = true`,
      values: [commentId],
    };

    const { rows } = await this._pool.query(query);

    return rows[0].likes_count;
  }
}

module.exports = LikeRepositoryPostgres;

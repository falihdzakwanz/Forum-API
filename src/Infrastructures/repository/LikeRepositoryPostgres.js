const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async setCommentLike(userId, commentId) {
    const selectLikes = {
      text: 'SELECT id, is_liked FROM likes WHERE owner = $1 AND comment = $2',
      values: [userId, commentId],
    };
    const { rows } = await this._pool.query(selectLikes);

    let setLikes = {};

    if (rows.length < 1) {
      const id = `like-${this._idGenerator()}`;

      setLikes = {
        text: 'INSERT INTO likes VALUES($1, $2, $3)',
        values: [id, userId, commentId],
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

  async countCommentLikes(commentIds) {
    const query = {
      text: `SELECT comment, CAST(COUNT(id) AS int)
             FROM likes
             WHERE comment IN (${commentIds.map((commentId, index) => `$${index + 1}`).join(', ')})
             AND is_liked = true
             GROUP BY comment`,
      values: commentIds,
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }
}

module.exports = LikeRepositoryPostgres;

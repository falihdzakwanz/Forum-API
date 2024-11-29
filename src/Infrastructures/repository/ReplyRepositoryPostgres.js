const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(reply) {
    const { owner, comment, content } = reply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4) RETURNING id, owner, content',
      values: [id, content, owner, comment],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async verifyAvailableReply(threadId, commentId, replyId) {
    const query = {
      text: `
            SELECT replies.id
            FROM replies
            JOIN comments ON replies.comment_id = comments.id
            WHERE replies.id = $1 AND replies.comment_id = $2 AND comments.thread_id = $3`,
      values: [replyId, commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Reply not found');
    }
  }

  async verifyReplyOwner(replyId, ownerId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0].owner !== ownerId) {
      throw new AuthorizationError('User is not authorized to access this reply');
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT
          replies.id,
          users.username,
          replies.content,
          replies.comment_id as comment,
          TO_CHAR(replies.created_at, 'YYYY-MM-DD"T"HH:MI:SS.MSZ') as date,
          replies.is_deleted
        FROM replies
        LEFT JOIN users ON replies.owner = users.id
        WHERE replies.comment_id = $1
        ORDER BY replies.created_at ASC
        `,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;

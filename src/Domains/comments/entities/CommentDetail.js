const ReplyDetail = require('../../replies/entities/ReplyDetail');

class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, replies,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.replies = replies;
  }

  _verifyPayload(payload) {
    const {
      id, username, date, content, replies,
    } = payload;

    if (!id || !username || !date || !content) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
            || typeof username !== 'string'
            || typeof date !== 'string'
            || typeof content !== 'string'
            || !Array.isArray(replies)
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (replies.length > 0) {
      replies.forEach((reply) => {
        if (!(reply instanceof ReplyDetail)) {
          throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
      });
    }
  }
}

module.exports = CommentDetail;

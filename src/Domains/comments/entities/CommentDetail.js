const ReplyDetail = require('../../replies/entities/ReplyDetail');

class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, likeCount = 0, replies,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.likeCount = likeCount;
    this.replies = replies;
  }

  _verifyPayload({
    id, username, date, content, likeCount = 0, replies,
  }) {
    if (!id || !username || !date || !content) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof date !== 'string'
      || typeof content !== 'string'
      || typeof likeCount !== 'number'
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

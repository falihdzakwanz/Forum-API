const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');

class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParam) {
    if (!useCaseParam.threadId) {
      throw new Error('GET_THREAD_DETAIL_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }
    const { threadId } = useCaseParam;

    const {
      id, username, title, body, date,
    } = await this._threadRepository.getThreadById(threadId);

    const commentsByThreadId = await this._commentRepository.getCommentsByThreadId(threadId);
    const comments = this.mapComments(commentsByThreadId);

    const repliesPromises = comments.map((comment) => this._replyRepository.getRepliesByCommentId(comment.id));
    const repliesResults = await Promise.all(repliesPromises);

    repliesResults.forEach((repliesByComment, index) => {
      comments[index].replies = repliesByComment.map((reply) => new ReplyDetail({
        id: reply.id,
        username: reply.username,
        date: reply.date,
        content: reply.content,
      }));
    });

    return new ThreadDetail({
      id,
      title,
      body,
      date,
      username,
      comments,
    });
  }

  mapComments(comments) {
    return comments.map(({
      id: commentId,
      username: commentatorUsername,
      date,
      content,
    }) => new CommentDetail({
      id: commentId,
      username: commentatorUsername,
      date,
      content,
      replies: [],
    }));
  }
}

module.exports = GetThreadDetailUseCase;

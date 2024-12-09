const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');

class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParam) {
    if (!useCaseParam.threadId) {
      throw new Error('GET_THREAD_DETAIL_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }
    const { threadId } = useCaseParam;

    await this._threadRepository.verifyAvailableThread(threadId);

    const {
      id, username, title, body, date,
    } = await this._threadRepository.getThreadById(threadId);

    const commentsByThreadId = await this._commentRepository.getCommentsByThreadId(threadId);
    const comments = await this.mapComments(commentsByThreadId);

    const repliesPromises = comments.map((comment) => this._replyRepository.getRepliesByCommentId(comment.id));
    const repliesResults = await Promise.all(repliesPromises);

    repliesResults.forEach((repliesByComment, index) => {
      comments[index].replies = repliesByComment.map((reply) => new ReplyDetail({
        id: reply.id,
        username: reply.username,
        date: reply.date,
        content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
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

  async mapComments(comments) {
    return Promise.all(comments.map(async ({
      id: commentId,
      username: commentatorUsername,
      date,
      content,
      is_deleted,
    }) => {
      const likeCount = await this._likeRepository.countCommentLikes(commentId);
      return new CommentDetail({
        id: commentId,
        username: commentatorUsername,
        date,
        content: is_deleted ? '**komentar telah dihapus**' : content,
        likeCount,
        replies: [],
      });
    }));
  }
}

module.exports = GetThreadDetailUseCase;

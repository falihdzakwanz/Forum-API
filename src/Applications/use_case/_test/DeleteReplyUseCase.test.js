const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('delete reply use case', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    const useCaseAuth = {
      id: 'user-999',
    };
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.verifyAvailableReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteReplyUseCase.execute(useCaseAuth, useCaseParam);

    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(useCaseParam.threadId);

    expect(mockCommentRepository.verifyAvailableComment)
      .toHaveBeenCalledWith(useCaseParam.threadId, useCaseParam.commentId);

    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith(useCaseParam.replyId, useCaseAuth.id);

    expect(mockReplyRepository.deleteReplyById)
      .toHaveBeenCalledWith(useCaseParam.replyId);
  });

  it('should throw error if thread not found', async () => {
    const useCaseAuth = {
      id: 'user-999',
    };
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('Thread not found')));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteReplyUseCase.execute(useCaseAuth, useCaseParam))
      .rejects
      .toThrowError('Thread not found');

    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(useCaseParam.threadId);
  });

  it('should throw error if comment not found', async () => {
    const useCaseAuth = {
      id: 'user-999',
    };
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('Comment not found')));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteReplyUseCase.execute(useCaseAuth, useCaseParam))
      .rejects
      .toThrowError('Comment not found');

    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(useCaseParam.threadId);

    expect(mockCommentRepository.verifyAvailableComment)
      .toHaveBeenCalledWith(useCaseParam.threadId, useCaseParam.commentId);
  });
});

const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const useCaseAuth = {
      id: 'user-123',
    };
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteCommentUseCase.execute(useCaseAuth, useCaseParam);

    expect(mockThreadRepository.verifyAvailableThread)
      .toBeCalledWith(useCaseParam.threadId);

    expect(mockCommentRepository.verifyAvailableComment)
      .toBeCalledWith(useCaseParam.threadId, useCaseParam.commentId);

    expect(mockCommentRepository.verifyCommentOwner)
      .toBeCalledWith(useCaseParam.commentId, useCaseAuth.id);

    expect(mockCommentRepository.deleteCommentById)
      .toHaveBeenCalledWith(
        useCaseParam.commentId,
        useCaseParam.threadId,
      );
  });

  it('should throw error if thread not found', async () => {
    const useCaseAuth = {
      id: 'user-123',
    };
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('Thread not found')));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteCommentUseCase.execute(useCaseAuth, useCaseParam))
      .rejects
      .toThrowError('Thread not found');

    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(useCaseParam.threadId);
  });

  it('should throw error if comment not found', async () => {
    const useCaseAuth = {
      id: 'user-123',
    };
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('Comment not found')));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteCommentUseCase.execute(useCaseAuth, useCaseParam))
      .rejects
      .toThrowError('Comment not found');

    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.verifyAvailableComment).toHaveBeenCalledWith(useCaseParam.threadId, useCaseParam.commentId);
  });
});

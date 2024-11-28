const AddReplyUseCase = require('../AddReplyUseCase');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Try and error',
    };
    const useCaseAuth = {
      id: 'user-345',
    };
    const useCaseParam = {
      threadId: 'thread123',
      commentId: 'comment-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn((reply) => Promise.resolve(new AddedReply({ ...reply, id: 'reply-123' })));

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const reply = await addReplyUseCase.execute(useCasePayload, useCaseAuth, useCaseParam);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toBeCalledWith(useCaseParam.threadId, useCaseParam.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(expect.objectContaining({
      owner: useCaseAuth.id,
      comment: useCaseParam.commentId,
      content: useCasePayload.content,
    }));
    expect(reply).toMatchObject({
      id: expect.any(String),
      owner: useCaseAuth.id,
      content: useCasePayload.content,
    });
  });

  it('should throw NotFoundError when thread id is not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Try and error',
    };
    const useCaseAuth = {
      id: 'user-345',
    };
    const useCaseParam = {
      threadId: 'thread-999',
      commentId: 'comment-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn(() => {
      throw new NotFoundError('Thread not found');
    });
    mockCommentRepository.verifyAvailableComment = jest.fn();
    mockReplyRepository.addReply = jest.fn();

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(addReplyUseCase.execute(useCasePayload, useCaseAuth, useCaseParam))
      .rejects
      .toThrowError(NotFoundError);

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.verifyAvailableComment).not.toBeCalled();
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });

  it('should throw NotFoundError when comment id is not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Try and error',
    };
    const useCaseAuth = {
      id: 'user-345',
    };
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-999',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn(() => {
      throw new NotFoundError('Comment not found');
    });
    mockReplyRepository.addReply = jest.fn();

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(addReplyUseCase.execute(useCasePayload, useCaseAuth, useCaseParam))
      .rejects
      .toThrowError(NotFoundError);

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toBeCalledWith(useCaseParam.threadId, useCaseParam.commentId);
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });
});

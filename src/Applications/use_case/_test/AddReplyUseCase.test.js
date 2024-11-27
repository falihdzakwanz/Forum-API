const AddReplyUseCase = require('../AddReplyUseCase');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('add reply use case', () => {
  it('should orchestrating the add reply action correctly', async () => {
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
    const expectedReply = new AddedReply({
      id: 'comment-123',
      owner: useCaseAuth.id,
      content: useCasePayload.content,
    });

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReply));

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const comment = await addReplyUseCase.execute(useCasePayload, useCaseAuth, useCaseParam);

    expect(mockThreadRepository.verifyAvailableThread)
      .toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toBeCalledWith(useCaseParam.threadId, useCaseParam.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      owner: useCaseAuth.id,
      comment: useCaseParam.commentId,
      content: useCasePayload.content,
    }));
    expect(comment).toStrictEqual(expectedReply);
  });

  it('should throw NotFoundError when thread id is not found', async () => {
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

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => {
        throw new NotFoundError('Thread not found');
      });

    mockCommentRepository.verifyAvailableComment = jest.fn();

    mockReplyRepository.addReply = jest.fn();

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(addReplyUseCase.execute(useCasePayload, useCaseAuth, useCaseParam))
      .rejects
      .toThrowError(NotFoundError);

    expect(mockThreadRepository.verifyAvailableThread)
      .toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.verifyAvailableComment).not.toBeCalled();
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });

  it('should throw NotFoundError when comment id is not found', async () => {
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

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => {
        throw new NotFoundError('Comment not found');
      });

    mockReplyRepository.addReply = jest.fn();

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(addReplyUseCase.execute(useCasePayload, useCaseAuth, useCaseParam))
      .rejects
      .toThrowError(NotFoundError);

    expect(mockThreadRepository.verifyAvailableThread)
      .toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toBeCalledWith(useCaseParam.threadId, useCaseParam.commentId);
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });
});

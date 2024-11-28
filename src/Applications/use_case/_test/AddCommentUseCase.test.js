const AddCommentUseCase = require('../AddCommentUseCase');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Try and error',
    };
    const useCaseAuth = {
      id: 'user-123',
    };
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn((comment) => Promise.resolve(new AddedComment({ ...comment, id: 'comment-123' })));

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const comment = await addCommentUseCase.execute(useCasePayload, useCaseAuth, useCaseParam);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(expect.objectContaining({
      owner: useCaseAuth.id,
      thread: useCaseParam.threadId,
      content: useCasePayload.content,
    }));
    expect(comment).toMatchObject({
      id: expect.any(String),
      owner: useCaseAuth.id,
      content: useCasePayload.content,
    });
  });
});

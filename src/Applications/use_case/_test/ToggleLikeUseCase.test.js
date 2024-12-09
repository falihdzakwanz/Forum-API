const ToggleLikeUseCase = require('../ToggleLikeUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('toggle comment\'s likes use case', () => {
  it('should orchestrating the toggle comment\'s likes action correctly', async () => {
    const useCaseAuth = {
      id: 'user-123',
    };
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-234',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockLikeRepository.toggleCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const toggleCommentLike = new ToggleLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await toggleCommentLike.execute(useCaseAuth, useCaseParam);

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCaseParam.threadId, useCaseParam.commentId);
    expect(mockLikeRepository.toggleCommentLike).toBeCalledWith(useCaseAuth.id, useCaseParam.commentId);
  });
});

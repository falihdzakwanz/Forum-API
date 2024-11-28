/* eslint-disable no-restricted-syntax */
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadDetailUseCase', () => {
  it('should throw error if there is no use case param', async () => {
    // Arrange
    const useCaseParam = {};

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: ThreadRepository,
      commentRepository: CommentRepository,
    });

    // Act & Assert
    await expect(getThreadDetailUseCase.execute(useCaseParam))
      .rejects
      .toThrowError('GET_THREAD_DETAIL_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    // Mock minimal data from the repositories
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve({
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      date: '2024-01-01T00:00:00.000Z',
      username: 'user123',
    }));

    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      {
        id: 'comment-1',
        username: 'userA',
        date: '2024-01-01T01:00:00.000Z',
        content: 'Comment 1',
        is_deleted: false,
      },
      {
        id: 'comment-2',
        username: 'userB',
        date: '2024-01-01T02:00:00.000Z',
        content: 'Comment 2',
        is_deleted: true,
      },
    ]));

    mockReplyRepository.getRepliesByCommentId = jest.fn((commentId) => {
      const replyData = {
        'comment-1': [
          {
            id: 'reply-1',
            comment: 'comment-1',
            username: 'userB',
            content: 'Reply 1',
            date: '2024-01-01T03:00:00.000Z',
            is_deleted: false,
          },
        ],
        'comment-2': [
          {
            id: 'reply-2',
            comment: 'comment-2',
            username: 'userA',
            content: 'Reply 2',
            date: '2024-01-01T04:00:00.000Z',
            is_deleted: true,
          },
        ],
      };
      return Promise.resolve(replyData[commentId] || []);
    });

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const threadDetail = await getThreadDetailUseCase.execute(useCaseParam);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCaseParam.threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-1');
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-2');

    expect(threadDetail).toMatchObject({
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      date: '2024-01-01T00:00:00.000Z',
      username: 'user123',
      comments: [
        {
          id: 'comment-1',
          username: 'userA',
          date: '2024-01-01T01:00:00.000Z',
          content: 'Comment 1',
          replies: [
            {
              id: 'reply-1',
              username: 'userB',
              content: 'Reply 1',
              date: '2024-01-01T03:00:00.000Z',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'userB',
          date: '2024-01-01T02:00:00.000Z',
          content: '**komentar telah dihapus**',
          replies: [
            {
              id: 'reply-2',
              username: 'userA',
              content: '**balasan telah dihapus**',
              date: '2024-01-01T04:00:00.000Z',
            },
          ],
        },
      ],
    });
  });

  it('should handle empty comments and replies correctly', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve({
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      date: '2024-01-01T00:00:00.000Z',
      username: 'user123',
    }));

    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([]));
    mockReplyRepository.getRepliesByCommentId = jest.fn(() => Promise.resolve([]));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const threadDetail = await getThreadDetailUseCase.execute(useCaseParam);

    // Assert
    expect(threadDetail).toMatchObject({
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      date: '2024-01-01T00:00:00.000Z',
      username: 'user123',
      comments: [],
    });
  });
});

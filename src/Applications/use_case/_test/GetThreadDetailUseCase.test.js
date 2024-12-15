/* eslint-disable no-restricted-syntax */
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('GetThreadDetailUseCase', () => {
  it('should throw error when threadId is not provided', async () => {
    const useCasePayload = {};
    const mockThreadRepository = {};
    const mockCommentRepository = {};
    const mockReplyRepository = {};
    const mockLikeRepository = {};
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });
    await expect(
      getThreadDetailUseCase.execute(useCasePayload),
    ).rejects.toThrowError('GET_THREAD_DETAIL_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should orchestrate the get thread detail action correctly', async () => {
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

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
            likeCount: 0,
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
            likeCount: 0,
            is_deleted: true,
          },
        ],
      };
      return Promise.resolve(replyData[commentId] || []);
    });

    mockLikeRepository.countCommentLikes = jest.fn((commentId) => {
      const likeData = {
        'comment-1': 5,
        'comment-2': 2,
      };
      return Promise.resolve(likeData[commentId] || 0);
    });

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    const threadDetail = await getThreadDetailUseCase.execute(useCaseParam);

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(
      useCaseParam.threadId,
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCaseParam.threadId,
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCaseParam.threadId,
    );
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      'comment-1',
    );
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      'comment-2',
    );
    expect(mockLikeRepository.countCommentLikes).toHaveBeenCalledWith(
      'comment-1',
    );
    expect(mockLikeRepository.countCommentLikes).toHaveBeenCalledWith(
      'comment-2',
    );

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
          likeCount: 5,
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
          likeCount: 2,
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
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

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
    mockLikeRepository.countCommentLikes = jest.fn(() => Promise.resolve(0));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    const threadDetail = await getThreadDetailUseCase.execute(useCaseParam);

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

/* eslint-disable no-restricted-syntax */
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('get thread detail use case', () => {
  it('should throw error if there is no use case param', async () => {
    const useCaseParam = {};

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: ThreadRepository,
      commentRepository: CommentRepository,
    });

    await expect(getThreadDetailUseCase.execute(useCaseParam))
      .rejects
      .toThrowError('GET_THREAD_DETAIL_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should orchestrating the get thread detail action correctly', async () => {
    const useCaseParam = {
      threadId: 'thread-123',
    };
    const mockThread = {
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };
    const mockThreadComments = [
      {
        id: 'comment-_pby2_tmXV6bcvcdev8xk',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_deleted: false,
      },
      {
        id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: '**komentar telah dihapus**',
        is_deleted: true,
      },
    ];
    const mockCommentReplies = [
      {
        id: 'reply-xNBtm9HPR-492AeiimpfN',
        comment: mockThreadComments[1].id,
        username: 'dicoding',
        content: 'sebuah balasan',
        date: '2021-08-08T07:59:48.766Z',
        is_deleted: false,
      },
      {
        id: 'reply-BErOXUSefjwWGW1Z10Ihk',
        comment: mockThreadComments[1].id,
        username: 'johndoe',
        content: '**balasan telah dihapus**',
        date: '2021-08-08T08:07:01.522Z',
        is_deleted: true,
      },
    ];
    const expectedThreadDetail = new ThreadDetail({
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        new CommentDetail({
          id: mockThreadComments[0].id,
          username: mockThreadComments[0].username,
          date: mockThreadComments[0].date,
          content: mockThreadComments[0].content,
          replies: [],
        }),
        new CommentDetail({
          id: mockThreadComments[1].id,
          username: mockThreadComments[1].username,
          date: mockThreadComments[1].date,
          content: mockThreadComments[1].content,
          replies: [
            new ReplyDetail({
              id: mockCommentReplies[0].id,
              username: mockCommentReplies[0].username,
              date: mockCommentReplies[0].date,
              content: mockCommentReplies[0].content,
            }),
            new ReplyDetail({
              id: mockCommentReplies[1].id,
              username: mockCommentReplies[1].username,
              date: mockCommentReplies[1].date,
              content: mockCommentReplies[1].content,
            }),
          ],
        }),
      ],
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadComments));

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation((commentId) => Promise.resolve(mockCommentReplies.filter((reply) => reply.comment === commentId)));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const threadDetail = await getThreadDetailUseCase.execute(useCaseParam);

    expect(threadDetail).toEqual(expectedThreadDetail);

    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(useCaseParam.threadId);

    expect(mockCommentRepository.getCommentsByThreadId)
      .toBeCalledWith(useCaseParam.threadId);

    for (const comment of mockThreadComments) {
      expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(comment.id);
    }

    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledTimes(mockThreadComments.length);
  });

  it('should handle empty replies correctly', async () => {
    const useCaseParam = {
      threadId: 'thread-123',
    };
    const mockThread = {
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };
    const mockThreadComments = [
      {
        id: 'comment-_pby2_tmXV6bcvcdev8xk',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_deleted: false,
      },
    ];
    const mockCommentReplies = [];
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadComments));

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockCommentReplies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const threadDetail = await getThreadDetailUseCase.execute(useCaseParam);

    expect(threadDetail.comments[0].replies).toEqual([]);
  });

  it('should handle non-empty replies correctly', async () => {
    const useCaseParam = {
      threadId: 'thread-123',
    };
    const mockThread = {
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };
    const mockThreadComments = [
      {
        id: 'comment-_pby2_tmXV6bcvcdev8xk',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_deleted: false,
      },
    ];
    const mockCommentReplies = [
      {
        id: 'reply-xNBtm9HPR-492AeiimpfN',
        comment: mockThreadComments[0].id,
        username: 'dicoding',
        content: 'sebuah balasan',
        date: '2021-08-08T07:59:48.766Z',
        is_deleted: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadComments));

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockCommentReplies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const threadDetail = await getThreadDetailUseCase.execute(useCaseParam);
    expect(threadDetail.comments[0].replies).toHaveLength(1);
    expect(threadDetail.comments[0].replies[0].id).toEqual(mockCommentReplies[0].id);
  });

  it('should handle deleted replies correctly', async () => {
    const useCaseParam = {
      threadId: 'thread-123',
    };
    const mockThread = {
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };
    const mockThreadComments = [
      {
        id: 'comment-_pby2_tmXV6bcvcdev8xk',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_deleted: false,
      },
    ];
    const mockCommentReplies = [
      {
        id: 'reply-xNBtm9HPR-492AeiimpfN',
        comment: mockThreadComments[0].id,
        username: 'dicoding',
        content: '**balasan telah dihapus**',
        date: '2021-08-08T07:59:48.766Z',
        is_deleted: true,
      },
    ];

    const expectedThreadDetail = new ThreadDetail({
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        new CommentDetail({
          id: mockThreadComments[0].id,
          username: mockThreadComments[0].username,
          date: mockThreadComments[0].date,
          content: mockThreadComments[0].content,
          replies: [
            new ReplyDetail({
              id: mockCommentReplies[0].id,
              username: mockCommentReplies[0].username,
              date: mockCommentReplies[0].date,
              content: '**balasan telah dihapus**',
            }),
          ],
        }),
      ],
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadComments));

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockCommentReplies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const threadDetail = await getThreadDetailUseCase.execute(useCaseParam);

    expect(threadDetail).toEqual(expectedThreadDetail);
  });
});

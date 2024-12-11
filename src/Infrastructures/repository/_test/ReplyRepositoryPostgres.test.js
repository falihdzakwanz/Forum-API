const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ReplyRepositoryPostgres', () => {
  const userId = 'user-123';
  const threadId = 'thread-8080';
  const commentId = 'comment-909192';
  const replyId = 'reply-951';

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: userId, username: 'John' });

    await ThreadsTableTestHelper.addThread({
      id: threadId,
      owner: userId,
      title: 'Taken 1',
      body: 'I am gonna find you and i am gonna k*ll you',
    });

    await CommentsTableTestHelper.addComment({
      id: commentId,
      owner: userId,
      thread: threadId,
      content: 'This is comment test',
    });
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await pool.end();
  });

  beforeEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.addReply({
      id: replyId,
      comment: commentId,
      owner: userId,
      content: 'Conner reply',
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  describe('addReply function', () => {
    it('should persist the reply correctly', async () => {
      const addReply = new AddReply({
        owner: userId,
        comment: commentId,
        content: 'Reply by John Wick',
      });

      const fakeIdGenerator = () => '777';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply(addReply);

      const replies = await RepliesTableTestHelper.findReplyById('reply-777');
      expect(replies).toHaveLength(1);
    });

    it('should return the reply correctly', async () => {
      const addReply = new AddReply({
        owner: userId,
        comment: commentId,
        content: 'Reply by Takumi Fujiwara',
      });

      const fakeIdGenerator = () => '901';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const reply = await replyRepositoryPostgres.addReply(addReply);

      expect(reply).toStrictEqual(new AddedReply({
        id: 'reply-901',
        owner: userId,
        content: addReply.content,
      }));
    });
  });

  describe('verifyAvailableReply function', () => {
    it('should throw NotFoundError when reply not available', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyAvailableReply(threadId, commentId, 'reply-1010101010101')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply available', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await expect(replyRepositoryPostgres.verifyAvailableReply(threadId, commentId, replyId)).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when user is not the reply\'s owner', async () => {
      const notOwnerId = 'user-110';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await expect(replyRepositoryPostgres.verifyReplyOwner(replyId, notOwnerId)).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is the comment\'s owner', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner(replyId, userId))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should delete reply from database', async () => {
      const repliesBeforeDelete = await RepliesTableTestHelper.findReplyById(replyId);
      expect(repliesBeforeDelete[0].is_deleted).toStrictEqual(false);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await replyRepositoryPostgres.deleteReplyById(replyId);

      const repliesAfterDelete = await RepliesTableTestHelper.findReplyById(replyId);
      expect(repliesAfterDelete[0].is_deleted).toStrictEqual(true);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should get replies by commentId from database', async () => {
      const replyUser1 = {
        id: 'user-88089',
        username: 'tupac',
      };
      await UsersTableTestHelper.addUser(replyUser1);

      const replyUser2 = {
        id: 'user-77077',
        username: 'shakur',
      };
      await UsersTableTestHelper.addUser(replyUser2);

      const comment = {
        id: 'comment-2202',
        owner: userId,
        thread: threadId,
        content: 'comment 1',
        createdAt: '2021-11-12T07:22:33.555Z',
        is_deleted: false,
      };
      await CommentsTableTestHelper.addComment(comment);

      const reply1 = {
        id: 'reply-3303',
        comment: comment.id,
        owner: replyUser1.id,
        username: replyUser1.username,
        content: 'reply 1',
        created_at: '2021-11-12T07:23:08.555Z',
        is_deleted: false,
      };
      await RepliesTableTestHelper.addReply(reply1);

      const reply2 = {
        id: 'reply-3304',
        comment: comment.id,
        owner: replyUser2.id,
        username: replyUser2.username,
        content: 'balasan 2',
        created_at: '2021-08-08T08:45:33.555Z',
        is_deleted: true,
      };
      await RepliesTableTestHelper.addReply(reply2);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const commentReplies = await replyRepositoryPostgres.getRepliesByCommentId(comment.id);

      expect(commentReplies).toStrictEqual([
        {
          id: reply2.id,
          comment: reply2.comment,
          username: reply2.username,
          content: reply2.content,
          date: reply2.created_at,
          is_deleted: reply2.is_deleted,
        },
        {
          id: reply1.id,
          comment: reply1.comment,
          username: reply1.username,
          content: reply1.content,
          date: reply1.created_at,
          is_deleted: reply1.is_deleted,
        },
      ]);
    });
  });
});

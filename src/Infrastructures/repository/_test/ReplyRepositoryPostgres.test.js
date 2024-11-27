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
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist the reply correctly', async () => {
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'jerkins' });

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        thread: threadId,
      });

      const addReply = new AddReply({
        owner: userId,
        comment: commentId,
        content: 'Reply content',
      });

      const fakeIdGenerator = () => '777';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply(addReply);

      const replies = await RepliesTableTestHelper.findReplyById('reply-777');
      expect(replies).toHaveLength(1);
    });

    it('should return the reply correctly', async () => {
      const userId = 'user-321';
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'johnson',
      });

      const threadId = 'thread-444';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      const commentId = 'comment-555';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        thread: threadId,
      });

      const addReply = new AddReply({
        owner: userId,
        comment: commentId,
        content: 'Reply content',
      });

      const fakeIdGenerator = () => '777';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const reply = await replyRepositoryPostgres.addReply(addReply);

      expect(reply).toStrictEqual(new AddedReply({
        id: 'reply-777',
        owner: userId,
        content: addReply.content,
      }));
    });
  });

  describe('verifyAvailableReply function', () => {
    it('should throw NotFoundError when reply not available', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyAvailableReply('thread-99991', 'comment-001122', 'reply-1010101010101')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply available', async () => {
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'jerkins',
      });

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        thread: threadId,
      });

      const addReply = new AddReply({
        owner: userId,
        comment: commentId,
        content: 'Reply content',
      });

      const fakeIdGenerator = () => '777';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      replyRepositoryPostgres.addReply(addReply);
      await expect(replyRepositoryPostgres.verifyAvailableReply(threadId, commentId, 'reply-777')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when user is not the reply\'s owner', async () => {
      const notOwnerId = 'user-110';
      const ownerId = 'user-921';
      await UsersTableTestHelper.addUser({ id: ownerId, username: 'jacob' });

      const threadId = 'thread-931';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: ownerId,
        title: 'Conner',
        body: 'Conner body',
      });

      const commentId = 'comment-941';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: ownerId,
        content: 'Conner content',
      });

      const replyId = 'reply-951';
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: ownerId,
        content: 'Conner reply',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner(replyId, notOwnerId)).rejects.toThrowError(AuthorizationError);
    });

    it('should throw NotFoundError when reply is not found', async () => {
      const notOwnerId = 'user-110';
      const replyId = 'reply-950';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner(replyId, notOwnerId)).rejects.toThrowError(NotFoundError);
    });

    it('should not throw AuthorizationError when user is the comment\'s owner', async () => {
      const ownerId = 'user-981';
      await UsersTableTestHelper.addUser({
        id: ownerId,
        username: 'Hanses',
      });

      const threadId = 'thread-931';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: ownerId,
        title: 'Conner',
        body: 'Conner body',
      });

      const commentId = 'comment-941';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: ownerId,
        content: 'Conner content',
      });

      const replyId = 'reply-951';
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: ownerId,
        content: 'Conner reply',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner(replyId, ownerId))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should delete reply from database', async () => {
      const ownerId = 'user-990';
      await UsersTableTestHelper.addUser({ id: ownerId, username: 'jaredleno' });

      const threadId = 'thread-880';
      await ThreadsTableTestHelper.addThread({
        id: threadId, owner: ownerId, title: 'The Man', body: 'The man body',
      });

      const commentId = 'comment-770';
      await CommentsTableTestHelper.addComment({
        id: commentId, thread: threadId, owner: ownerId, content: 'The man comment',
      });

      const replyId = 'reply-660';
      await RepliesTableTestHelper.addReply({
        id: replyId, comment: commentId, owner: ownerId, content: 'The man reply',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await replyRepositoryPostgres.deleteReplyById(replyId);

      const replies = await RepliesTableTestHelper.findReplyById(replyId);
      expect(replies[0].is_deleted).toStrictEqual(true);
    });

    it('should throw NotFoundError when the reply is not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      return expect(replyRepositoryPostgres.deleteReplyById('reply-caur'))
        .rejects
        .toThrowError(NotFoundError);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should get replies by commentId from database', async () => {
      const owner = {
        id: 'user-9909',
        username: 'manwhocantbemoved',
      };
      await UsersTableTestHelper.addUser(owner);

      const commentator1 = {
        id: 'user-8808',
        username: 'tupac',
      };
      await UsersTableTestHelper.addUser(commentator1);

      const commentator2 = {
        id: 'user-7707',
        username: 'shakur',
      };
      await UsersTableTestHelper.addUser(commentator2);

      const threadId = 'thread-1101';
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: owner.id,
        title: 'All eyez on me',
        body: 'Live life as a thug',
      });

      const comment = {
        id: 'comment-2202',
        owner: owner.id,
        thread: threadId,
        content: 'comment 1',
        createdAt: '2021-11-12T07:22:33.555Z',
        is_deleted: false,
      };
      await CommentsTableTestHelper.addComment(comment);

      const reply1 = {
        id: 'reply-3303',
        comment: comment.id,
        owner: commentator1.id,
        username: commentator1.username,
        content: 'reply 1',
        created_at: '2021-11-12T07:23:08.555Z',
        is_deleted: false,
      };
      await RepliesTableTestHelper.addReply(reply1);

      const reply2 = {
        id: 'reply-3304',
        comment: comment.id,
        owner: commentator2.id,
        username: commentator2.username,
        content: '**balasan telah dihapus**',
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

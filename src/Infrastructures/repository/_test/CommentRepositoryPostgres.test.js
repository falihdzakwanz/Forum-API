const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  const userId = 'user-123';
  const threadId = 'thread-8080';
  const commentId = 'comment-909192';

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: userId, username: 'John' });

    await ThreadsTableTestHelper.addThread({
      id: threadId,
      owner: userId,
      title: 'Taken 1',
      body: 'I am gonna find you and i am gonna k*ll you',
    });
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  beforeEach(async () => {
    await CommentsTableTestHelper.addComment({
      id: commentId,
      owner: userId,
      thread: threadId,
      content: 'This is comment test',
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  describe('addComment function', () => {
    it('should persist the comment correctly', async () => {
      const addComment = new AddComment({
        owner: userId,
        thread: threadId,
        content: 'This is the comment',
      });

      const fakeIdGenerator = () => '333';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(addComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-333');
      expect(comments).toHaveLength(1);
    });

    it('should return the comment correctly', async () => {
      const addComment = new AddComment({
        owner: userId,
        thread: threadId,
        content: 'This is the comment 2',
      });
      const fakeIdGenerator = () => '145';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const comment = await commentRepositoryPostgres.addComment(addComment);

      expect(comment).toStrictEqual(new AddedComment({
        id: 'comment-145',
        owner: userId,
        content: addComment.content,
      }));
    });
  });

  describe('verifyAvailableComment function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(commentRepositoryPostgres.verifyAvailableComment(threadId, 'comment-87417294719740-39575')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(commentRepositoryPostgres.verifyAvailableComment(threadId, commentId)).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when user is not the comment\'s owner', async () => {
      const notOwnerId = 'user-110';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner(commentId, notOwnerId)).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is the comment\'s owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner(commentId, userId)).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should delete comment from database', async () => {
      const commentsBeforeDelete = await CommentsTableTestHelper.findCommentById(commentId);
      expect(commentsBeforeDelete[0].is_deleted).toStrictEqual(false);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await commentRepositoryPostgres.deleteCommentById(commentId, threadId);

      const commentsAfterDelete = await CommentsTableTestHelper.findCommentById(commentId);
      expect(commentsAfterDelete[0].is_deleted).toStrictEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should get comments by threadId from database', async () => {
      const commentator1 = {
        id: 'user-189024790',
        username: 'Fujiwara',
      };
      await UsersTableTestHelper.addUser(commentator1);

      const commentator2 = {
        id: 'user-98292947',
        username: 'Takumi',
      };
      await UsersTableTestHelper.addUser(commentator2);

      const testThreadId = 'thread-39102';
      await ThreadsTableTestHelper.addThread({
        id: testThreadId,
        owner: userId,
        title: 'Taken 1',
        body: 'I am gonna find you and i am gonna k*ll you',
      });
      const comment1 = {
        id: 'comment-98412',
        thread: testThreadId,
        owner: commentator1.id,
        content: 'comment 1',
        created_at: '2021-11-12T07:22:33.555Z',
        is_deleted: false,
      };
      await CommentsTableTestHelper.addComment(comment1);

      const comment2 = {
        id: 'comment-7472',
        thread: testThreadId,
        owner: commentator2.id,
        content: 'comment 2',
        created_at: '2021-08-08T08:45:33.555Z',
        is_deleted: true,
      };
      await CommentsTableTestHelper.addComment(comment2);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const threadWithComments = await commentRepositoryPostgres.getCommentsByThreadId(testThreadId);

      expect(threadWithComments).toStrictEqual([
        {
          id: comment2.id,
          username: commentator2.username,
          content: comment2.content,
          date: comment2.created_at,
          is_deleted: comment2.is_deleted,
        },
        {
          id: comment1.id,
          username: commentator1.username,
          content: comment1.content,
          date: comment1.created_at,
          is_deleted: comment1.is_deleted,
        },
      ]);
    });
  });
});

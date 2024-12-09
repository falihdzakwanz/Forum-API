const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('setCommentLike function', () => {
    it('should set the comment\'s likes correctly', async () => {
      const userId = 'user-2342';
      await UsersTableTestHelper.addUser({ id: userId, username: 'gundala' });

      const threadId = 'thread-90152891';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const commentId = 'comment-6868321';
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });

      const fakeIdGenerator = () => '5445';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.setCommentLike(userId, commentId);

      const likes = await LikesTableTestHelper.findLikeById('like-5445');
      expect(likes).toHaveLength(1);
      expect(likes[0].is_liked).toEqual(true);
    });

    it('should update the existed comment\'s likes correctly', async () => {
      const userId = 'user-2342';
      await UsersTableTestHelper.addUser({ id: userId, username: 'gundala' });

      const threadId = 'thread-90152891';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const commentId = 'comment-6868321';
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });

      const likeId = 'like-9183';

      await LikesTableTestHelper.addLike({
        id: likeId,
        owner: userId,
        comment: commentId,
        is_liked: true,
      });

      const fakeIdGenerator = () => '9183';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.setCommentLikes(userId, commentId);

      const likes = await LikesTableTestHelper.findLikeById(likeId);
      expect(likes[0].is_liked).toEqual(false);
    });
  });

  describe('countCommentLikes function', () => {
    it('should count comment\'s likes correctly', async () => {
      const userId1 = 'user-2342';
      await UsersTableTestHelper.addUser({ id: userId1, username: 'gundala' });

      const userId2 = 'user-414';
      await UsersTableTestHelper.addUser({ id: userId2, username: 'garuda' });

      const threadId = 'thread-90152891';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId1 });

      const commentId1 = 'comment-6868321';
      await CommentsTableTestHelper.addComment({ id: commentId1, owner: userId1, thread: threadId });

      const commentId2 = 'comment-90781';
      await CommentsTableTestHelper.addComment({ id: commentId2, owner: userId2, thread: threadId });

      await LikesTableTestHelper.addLike({
        id: 'like-134',
        owner: userId1,
        comment: commentId1,
      });

      await LikesTableTestHelper.addLike({
        id: 'like-145',
        owner: userId2,
        comment: commentId1,
      });
      await LikesTableTestHelper.addLike({
        id: 'like-224',
        owner: userId1,
        comment: commentId2,
      });

      const fakeIdGenerator = () => '5445';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const likes = await likeRepositoryPostgres.countCommentLikes([commentId1, commentId2]);

      expect(likes).toHaveLength(2);
      expect(likes[0].count).toEqual(likes[0].comment === commentId1 ? 2 : 1);
      expect(likes[1].count).toEqual(likes[1].comment === commentId2 ? 1 : 2);
    });
  });
});

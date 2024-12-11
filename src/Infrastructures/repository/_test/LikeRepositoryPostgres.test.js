const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
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

    await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
    await pool.end();
  });

  beforeEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  describe('toggleCommentLike function', () => {
    it('should set the comment\'s likes correctly', async () => {
      const fakeIdGenerator = () => '5445';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.toggleCommentLike(userId, commentId);

      const likes = await LikesTableTestHelper.findLikeById('like-5445');
      expect(likes).toHaveLength(1);
      expect(likes[0].is_liked).toEqual(true);
    });

    it('should update the existed comment\'s likes correctly', async () => {
      const likeId = 'like-9183';

      await LikesTableTestHelper.addLike({
        id: likeId,
        owner: userId,
        comment: commentId,
        is_liked: true,
      });

      const fakeIdGenerator = () => '9183';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.toggleCommentLike(userId, commentId);

      const likes = await LikesTableTestHelper.findLikeById(likeId);
      expect(likes[0].is_liked).toEqual(false);
    });
  });

  describe('countCommentLikes function', () => {
    it('should count a single comment\'s likes correctly', async () => {
      const userId1 = 'user-909';
      await UsersTableTestHelper.addUser({ id: userId1, username: 'John Wick' });

      const userId2 = 'user-212912';
      await UsersTableTestHelper.addUser({ id: userId2, username: 'Fujiwara Takumi' });

      const userId3 = 'user-1290';
      await UsersTableTestHelper.addUser({ id: userId3, username: 'Takahasi Keisuke' });

      const testThreadId = 'thread-90152891';
      await ThreadsTableTestHelper.addThread({ id: testThreadId, owner: userId });

      const commentId1 = 'comment-6868321';
      await CommentsTableTestHelper.addComment({ id: commentId1, owner: userId1, thread: testThreadId });

      const commentId2 = 'comment-90781';
      await CommentsTableTestHelper.addComment({ id: commentId2, owner: userId2, thread: testThreadId });

      const commentId3 = 'comment-907811';
      await CommentsTableTestHelper.addComment({ id: commentId3, owner: userId3, thread: testThreadId });

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

      const likeCount1 = await likeRepositoryPostgres.countCommentLikes(commentId1);
      const likeCount2 = await likeRepositoryPostgres.countCommentLikes(commentId2);
      const likeCount3 = await likeRepositoryPostgres.countCommentLikes(commentId3);

      expect(likeCount1).toEqual(2);
      expect(likeCount2).toEqual(1);
      expect(likeCount3).toEqual(0);
    });
  });
});

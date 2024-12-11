const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('ThreadRepositoryPostgres', () => {
  const userId = 'user-123';
  const threadId = 'thread-8080';

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
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist the thread correctly', async () => {
      const addedThread = new AddThread({
        owner: userId,
        title: 'John Wick Parabellum',
        body: 'John wick parabellum is the best',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.addThread(addedThread);

      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return the thread correctly', async () => {
      const addedThread = new AddThread({
        owner: userId,
        title: 'John Wick Parabellum',
        body: 'John wick parabellum is the best',
      });
      const fakeIdGenerator = () => '999';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const thread = await threadRepositoryPostgres.addThread(addedThread);

      expect(thread).toStrictEqual(new AddedThread({
        id: 'thread-999',
        owner: userId,
        title: addedThread.title,
      }));
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when thread not available', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(threadRepositoryPostgres.verifyAvailableThread('thread-666')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(threadRepositoryPostgres.verifyAvailableThread(threadId)).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should return thread detail correctly', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const threadDetail = await threadRepositoryPostgres.getThreadById(threadId);

      expect(threadDetail).toStrictEqual({
        id: 'thread-8080',
        username: 'John',
        title: 'Taken 1',
        body: 'I am gonna find you and i am gonna k*ll you',
        date: expect.any(String),
      });
    });
  });
});

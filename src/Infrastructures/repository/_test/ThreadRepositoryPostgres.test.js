const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist the thread correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'tester',
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      const addedThread = new AddThread({
        owner: 'user-123',
        title: 'The Title',
        body: 'The body of thread',
      });

      const fakeIdGenerator = () => '321';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(addedThread);

      const threads = await ThreadsTableTestHelper.findThreadsById('thread-321');
      expect(threads).toHaveLength(1);
    });

    it('should return the thread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'tester2' });

      const addedThread = new AddThread({
        owner: 'user-12345',
        title: 'The Title',
        body: 'The body of thread',
      });
      const fakeIdGenerator = () => '999';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const thread = await threadRepositoryPostgres.addThread(addedThread);

      expect(thread).toStrictEqual(new AddedThread({
        id: 'thread-999',
        owner: 'user-12345',
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
      await UsersTableTestHelper.addUser({
        id: 'user-5312',
        username: 'jareb',
        password: 'password123',
        fullname: 'Jareb User',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-5312',
        title: 'Thread',
        body: 'Thread body test',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(threadRepositoryPostgres.verifyAvailableThread('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should return thread detail correctly', async () => {
      const user = { id: 'user-12814', username: 'john' };
      await UsersTableTestHelper.addUser(user);

      const thread = {
        id: 'thread-321',
        owner: user.id,
        title: 'abc',
        body: 'abc',
        created_at: '2021-08-08T07:19:09.775Z',
      };
      await ThreadsTableTestHelper.addThread(thread);

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const threadDetail = await threadRepositoryPostgres.getThreadById(thread.id);

      expect(threadDetail).toStrictEqual({
        id: thread.id,
        username: user.username,
        title: thread.title,
        body: thread.body,
        date: thread.created_at,
      });
    });

    it('should throw NotFoundError when threadId is not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.verifyAvailableThread('thread-99999999')).rejects.toThrowError(NotFoundError);
    });
  });
});

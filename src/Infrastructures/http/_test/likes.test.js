const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  let threadId;
  let commentId;
  let accessToken;

  beforeAll(async () => {
    const server = await createServer(container);

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'lincoln',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'lincoln',
        password: 'secret',
      },
    });

    const loginData = JSON.parse(loginResponse.payload);
    accessToken = loginData.data.accessToken;

    const addThreadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'title test',
        body: 'body test',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const threadData = JSON.parse(addThreadResponse.payload);
    threadId = threadData.data.addedThread.id;

    const addCommentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: { content: 'comment now' },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const commentData = JSON.parse(addCommentResponse.payload);
    commentId = commentData.data.addedComment.id;
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  it('should respond with 200 and success status when like a comment', async () => {
    const server = await createServer(container);
    const response = await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');

    const likes = await LikesTableTestHelper.findLikesByCommentId(commentId);
    expect(likes).toHaveLength(1);
    expect(likes[0].is_liked).toEqual(true);
  });

  it('should respond with 200 and success status when unlike a comment', async () => {
    const server = await createServer(container);

    await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const response = await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');

    const likes = await LikesTableTestHelper.findLikesByCommentId(commentId);
    expect(likes[0].is_liked).toEqual(false);
  });
});

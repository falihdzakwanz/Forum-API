const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  let server;
  let accessToken;
  let thread;

  beforeAll(async () => {
    server = await createServer(container);

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'John',
        password: 'secret',
        fullname: 'Jown Wick',
      },
    });

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'John',
        password: 'secret',
      },
    });

    const responseJson = JSON.parse(loginResponse.payload);
    accessToken = responseJson.data.accessToken;

    const addThreadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'John Wick Parabellum',
        body: 'About john wick parabellum movie',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const addedThread = JSON.parse(addThreadResponse.payload);
    thread = addedThread.data.addedThread;
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const requestPayload = {
        content: 'This is comment about john wick parabellum',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {};

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: 1234,
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 if request correct', async () => {
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments`,
        payload: { content: 'This is comment about john wick in paris' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const addedCommentResponse = JSON.parse(addCommentResponse.payload);
      const { addedComment } = addedCommentResponse.data;

      const deleteCommentResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(deleteCommentResponse.payload);
      expect(deleteCommentResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 if user is not the comment\'s owner', async () => {
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments`,
        payload: { content: 'tes tes konten tes' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const addedCommentResponse = JSON.parse(addCommentResponse.payload);
      const { addedComment } = addedCommentResponse.data;

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'Rambo',
          password: 'secret',
          fullname: 'John Rambo',
        },
      });

      const nonOwnerLogin = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'Rambo',
          password: 'secret',
        },
      });
      const nonOwnerLoginResponse = JSON.parse(nonOwnerLogin.payload);
      const nonOwnerAccessToken = nonOwnerLoginResponse.data.accessToken;

      const deleteCommentResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${nonOwnerAccessToken}`,
        },
      });

      const responseJson = JSON.parse(deleteCommentResponse.payload);
      expect(deleteCommentResponse.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('User is not authorized to access this comment');
    });

    it('should respond 404 if the thread not found', async () => {
      const deleteThreadResponse = await server.inject({
        method: 'DELETE',
        url: '/threads/random-id/comments/comment-random-id',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(deleteThreadResponse.payload);
      expect(deleteThreadResponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread not found');
    });

    it('should respond 404 if the comment not found', async () => {
      const deleteCommentResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread.id}/comments/comment-random-id`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(deleteCommentResponse.payload);
      expect(deleteCommentResponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment not found');
    });
  });
});

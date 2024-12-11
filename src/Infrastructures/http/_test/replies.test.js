const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  let server;
  let accessToken;
  let thread;
  let comment;

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

    const addCommentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${thread.id}/comments`,
      payload: { content: 'This is the test comment' },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const addedCommentResponse = JSON.parse(addCommentResponse.payload);
    comment = addedCommentResponse.data.addedComment;
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted comment', async () => {
      const addReplyresponse = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments/${comment.id}/replies`,
        payload: { content: 'This is reply about john wick comment' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addReplyresponse.payload);
      expect(addReplyresponse.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const addReplyresponse = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments/${comment.id}/replies`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addReplyresponse.payload);
      expect(addReplyresponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const addReplyresponse = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments/${comment.id}/replies`,
        payload: { content: {} },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addReplyresponse.payload);
      expect(addReplyresponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread to be replied not found', async () => {
      const addReplyresponse = await server.inject({
        method: 'POST',
        url: `/threads/xxx/comments/${comment.id}/replies`,
        payload: { content: 'This is reply about john wick comment' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addReplyresponse.payload);
      expect(addReplyresponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread not found');
    });

    it('should response 404 when comment to be replied not found', async () => {
      const addReplyresponse = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments/xxx/replies`,
        payload: { content: 'This is reply about john wick comment' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(addReplyresponse.payload);
      expect(addReplyresponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment not found');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 if request correct', async () => {
      const addReplyresponse = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments/${comment.id}/replies`,
        payload: { content: 'This is reply about john wick comment' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const addedReplyResponse = JSON.parse(addReplyresponse.payload);
      const { addedReply } = addedReplyResponse.data;

      const deleteReplyResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread.id}/comments/${comment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(deleteReplyResponse.payload);
      expect(deleteReplyResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 if user is not the reply\'s owner', async () => {
      const addReplyresponse = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments/${comment.id}/replies`,
        payload: { content: 'tes tes reply tes' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const addedReplyResponse = JSON.parse(addReplyresponse.payload);
      const { addedReply } = addedReplyResponse.data;

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'Fujiwara',
          password: 'secret',
          fullname: 'Fujiwara Bunta',
        },
      });

      const nonOwnerLogin = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'Fujiwara',
          password: 'secret',
        },
      });
      const nonOwnerLoginResponse = JSON.parse(nonOwnerLogin.payload);
      const nonOwnerAccessToken = nonOwnerLoginResponse.data.accessToken;

      const deleteReplyResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread.id}/comments/${comment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${nonOwnerAccessToken}`,
        },
      });

      const responseJson = JSON.parse(deleteReplyResponse.payload);
      expect(deleteReplyResponse.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('User is not authorized to access this reply');
    });

    it('should response 404 if the reply not found', async () => {
      const deleteReplyResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread.id}/comments/${comment.id}/replies/random-id-here`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(deleteReplyResponse.payload);
      expect(deleteReplyResponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Reply not found');
    });
  });
});

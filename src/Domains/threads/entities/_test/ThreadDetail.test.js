const ThreadDetail = require('../ThreadDetail');
const CommentDetail = require('../../../comments/entities/CommentDetail');

describe('ThreadDetail entity', () => {
  it('should throw an error when did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Some Thread Title',
      body: 'Lorem Ipsum Dolor',
      date: '2023-09-21',
      username: 'abc',
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw an error when did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'Some Thread Title',
      body: 'Lorem Ipsum Dolor',
      date: '2023-09-21',
      username: 'abc',
    };

    const payload2 = {
      id: 'thread-123',
      title: 'Some Thread Title',
      body: 'Lorem Ipsum Dolor',
      date: '2023-09-21',
      username: 'abc',
      comments: [
        {
          id: 'comment-123',
          username: 'thecommentator',
          date: '2021-08-08T08:55:09.775Z',
          content: 'some comment',
          replies: [],
        },
      ],
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new ThreadDetail(payload2)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should return ThreadDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Some Thread Title',
      body: 'Lorem Ipsum Dolor',
      date: '2023-09-21',
      username: 'abc',
      comments: [
        new CommentDetail({
          id: 'comment-124',
          username: 'thecommentator',
          date: '2021-08-08T08:55:09.775Z',
          content: 'some comment',
          replies: [],
        }),
        new CommentDetail({
          id: 'comment-125',
          username: 'thecommentator',
          date: '2021-08-08T08:55:09.775Z',
          content: 'some comment',
          replies: [],
        }),
      ],
    };

    // Action
    const {
      id, title, body, date, username, comments,
    } = new ThreadDetail(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toEqual(payload.comments);
  });

  it('should create ThreadDetail object correctly when comments is an empty array', () => {
    const payload = {
      id: 'thread-123',
      title: 'Some Thread Title',
      body: 'Lorem Ipsum Dolor',
      date: '2023-09-21',
      username: 'abc',
      comments: [],
    };

    // Action
    const {
      id, title, body, date, username, comments,
    } = new ThreadDetail(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toHaveLength(0);
  });
});

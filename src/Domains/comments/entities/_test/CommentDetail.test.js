const CommentDetail = require('../CommentDetail');
const ReplyDetail = require('../../../replies/entities/ReplyDetail');

describe('a CommentDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'abc',
      username: 'abc',
      date: '2021-08-08T07:22:33.555Z',
      replies: [],
    };

    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'abc',
      username: 'abc',
      date: '2021-08-08T07:22:33.555Z',
      content: 123,
      replies: [],
    };

    const payload2 = {
      id: 'abc',
      username: 'abc',
      date: '2021-08-08T07:22:33.555Z',
      content: 'content',
      replies: [
        {
          id: 'reply-BErOXUSefjwWGW1Z10Ihk',
          content: '**balasan telah dihapus**',
          date: '2021-08-08T07:59:48.766Z',
          username: 'johndoe',
        },
      ],
    };

    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CommentDetail(payload2)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetail object correctly', () => {
    const payload = {
      id: 'comment-_pby2_tmXV6bcvcdev8xk',
      username: 'johndoe',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      replies: [
        new ReplyDetail({
          id: 'reply-BErOXUSefjwWGW1Z10Ihk',
          content: '**balasan telah dihapus**',
          date: '2021-08-08T07:59:48.766Z',
          username: 'johndoe',
        }),
        new ReplyDetail({
          id: 'reply-xNBtm9HPR-492AeiimpfN',
          content: 'sebuah balasan',
          date: '2021-08-08T08:07:01.522Z',
          username: 'dicoding',
        }),
      ],
    };

    const {
      id,
      username,
      content,
      date,
      replies,
    } = new CommentDetail(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(replies).toEqual(payload.replies);
  });

  it('should create CommentDetail object correctly when replies is an empty array', () => {
    const payload = {
      id: 'comment-_pby2_tmXV6bcvcdev8xk',
      username: 'johndoe',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      replies: [],
    };

    const {
      id, username, content, date, replies,
    } = new CommentDetail(payload);
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(replies).toHaveLength(0);
  });
});

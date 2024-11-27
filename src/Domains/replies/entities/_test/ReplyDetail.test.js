const ReplyDetail = require('../ReplyDetail');

describe('a ReplyDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'abc',
      content: 'abc',
      date: 'abc',
    };

    expect(() => new ReplyDetail(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'abc',
      content: 'abc',
      date: 'abc',
      username: 123,
    };

    expect(() => new ReplyDetail(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailReply object correctly', () => {
    const payload = {
      id: 'abc',
      content: 'abc',
      date: 'abc',
      username: 'abc',
    };

    const {
      id, content, date, username,
    } = new ReplyDetail(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});

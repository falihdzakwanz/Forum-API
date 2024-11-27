const AddThread = require('../../../Domains/threads/entities/AddThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'Thread Title',
      body: 'Body of use case',
    };
    const useCaseAuth = {
      id: 'user-123',
    };
    const expectedThread = new AddThread({
      owner: 'user-123',
      title: useCasePayload.title,
      body: useCasePayload.body,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const thread = await addThreadUseCase.execute(useCasePayload, useCaseAuth);

    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread({
      owner: useCaseAuth.id,
      title: useCasePayload.title,
      body: useCasePayload.body,
    }));
    expect(thread).toStrictEqual(expectedThread);
  });
});

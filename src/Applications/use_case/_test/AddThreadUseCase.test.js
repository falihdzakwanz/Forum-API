const AddThread = require('../../../Domains/threads/entities/AddThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'The theory of Fujiwara Bunta',
      body: 'Fujiwara Bunta is The GOAT',
    };
    const useCaseAuth = {
      id: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation((thread) => Promise.resolve(new AddThread(thread)));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const thread = await addThreadUseCase.execute(useCasePayload, useCaseAuth);

    expect(mockThreadRepository.addThread).toBeCalledWith(expect.objectContaining({
      owner: useCaseAuth.id,
      title: useCasePayload.title,
      body: useCasePayload.body,
    }));
    expect(thread).toMatchObject({
      owner: useCaseAuth.id,
      title: useCasePayload.title,
      body: useCasePayload.body,
    });
  });
});

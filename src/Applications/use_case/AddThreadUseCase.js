const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, useCaseAuth) {
    const { id } = useCaseAuth;

    const thread = this._threadRepository.addThread(new AddThread({
      owner: id,
      title: useCasePayload.title,
      body: useCasePayload.body,
    }));

    return thread;
  }
}

module.exports = AddThreadUseCase;

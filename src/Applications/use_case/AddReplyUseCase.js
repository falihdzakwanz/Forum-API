const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ commentRepository, replyRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, useCaseAuth, useCaseParam) {
    const { id } = useCaseAuth;

    await this._threadRepository.verifyAvailableThread(useCaseParam.threadId);
    await this._commentRepository.verifyAvailableComment(useCaseParam.threadId, useCaseParam.commentId);

    return this._replyRepository.addReply(new AddReply({
      owner: id,
      comment: useCaseParam.commentId,
      content: useCasePayload.content,
    }));
  }
}

module.exports = AddReplyUseCase;

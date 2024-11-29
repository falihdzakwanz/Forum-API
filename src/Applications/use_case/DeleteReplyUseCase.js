class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCaseAuth, useCaseParam) {
    const { id: ownerId } = useCaseAuth;
    const { threadId, commentId, replyId } = useCaseParam;

    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(threadId, commentId);
    await this._replyRepository.verifyAvailableReply(threadId, commentId, replyId);
    await this._replyRepository.verifyReplyOwner(replyId, ownerId);
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;

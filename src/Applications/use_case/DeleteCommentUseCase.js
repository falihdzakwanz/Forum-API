class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCaseAuth, useCaseParam) {
    const { id } = useCaseAuth;

    await this._threadRepository.verifyAvailableThread(useCaseParam.threadId);

    await this._commentRepository.verifyCommentOwner(useCaseParam.commentId, id);

    await this._commentRepository.deleteCommentById(useCaseParam.commentId, useCaseParam.threadId);
  }
}

module.exports = DeleteCommentUseCase;

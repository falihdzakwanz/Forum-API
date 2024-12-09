class ToggleLikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseAuth, useCaseParam) {
    const { id } = useCaseAuth;
    const { threadId, commentId } = useCaseParam;

    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(threadId, commentId);
    await this._likeRepository.toggleCommentLike(id, commentId);
  }
}

module.exports = ToggleLikeUseCase;

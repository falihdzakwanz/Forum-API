const ToggleLikeUseCase = require('../../../../Applications/use_case/ToggleLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeToggleHandler = this.putLikeToggleHandler.bind(this);
  }

  async putLikeToggleHandler(request, h) {
    const toggleCommentLike = this._container.getInstance(ToggleLikeUseCase.name);
    await toggleCommentLike.execute(request.auth.credentials, request.params);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;

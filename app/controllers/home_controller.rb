class HomeController < ApplicationController
  before_action :authenticate_user!

  def lobby
    props = {
      app: 'lobby',
      authentication: current_user && current_user.auth_info,
    }
    render component: 'Root', props: props
  end

  def game
    @game = Game.find(params[:game_id])

    props = {
      app: 'game',
      authentication: current_user && current_user.auth_info,
      debug: false,
      game: @game.as_json(only: [:id, :name, :module]),
    }
    render component: 'Root', props: props
  end
end

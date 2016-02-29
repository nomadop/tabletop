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
    room = current_user.room
    redirect_to :root unless room

    props = {
      app: 'game',
      authentication: current_user && current_user.auth_info,
      debug: false,
      room: room.as_json(only: [:id]),
      game: room.game.as_json(only: [:id, :name, :module]),
    }
    render component: 'Root', props: props
  end
end

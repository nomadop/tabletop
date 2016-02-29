class HomeController < ApplicationController
  before_action :authenticate_user!
  before_action :require_in_room, only: [:game]
  before_action :require_out_room, only: [:lobby]

  def lobby
    props = {
      app: 'lobby',
      authentication: current_user && current_user.auth_info,
      games: Game.all.as_json(only: [:id, :name]),
      rooms: Room.all.as_json(only: [:name], methods: [:join_path]),
    }
    render component: 'Root', props: props
  end

  def game
    props = {
      app: 'game',
      authentication: current_user && current_user.auth_info,
      debug: false,
      room: @room.as_json(only: [:id]),
      game: @room.game.as_json(only: [:id, :name, :module]),
    }
    render component: 'Root', props: props
  end
end

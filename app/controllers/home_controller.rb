class HomeController < ApplicationController
  before_action :authenticate_user!
  before_action :require_in_room, only: [:game]
  before_action :require_out_room, only: [:lobby]

  def lobby
    props = {
      app: 'lobby',
      authentication: current_user && current_user.auth_info,
      games: Game.all.as_json(only: [:id, :name]),
      rooms: Room.play.as_json(only: [:name], methods: [:join_path]),
    }
    render component: 'Root', props: props
  end

  def game
    props = {
      app: 'game',
      authentication: current_user && current_user.auth_info,
      debug: params[:debug],
      room: @room.as_json(only: [:id]),
      game: @room.game.as_json(only: [:id, :name, :module, :start_scale]),
    }
    render component: 'Root', props: props
  end

  def dev
    game = Game.find(params[:game_id])
    dev_room = game.dev_room
    return redirect_to '/game', notice: 'You are already in another room' if current_user.room && current_user.room != dev_room
    dev_room.join(current_user) if current_user.room.nil?

    props = {
      app: 'game',
      authentication: current_user && current_user.auth_info,
      debug: false,
      room: dev_room.as_json(only: [:id]),
      game: game.as_json(only: [:id, :name, :module, :start_scale]),
      dev_mode: true,
    }
    render component: 'Root', props: props
  end
end

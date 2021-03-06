class HomeController < ApplicationController
  before_action :authenticate_user!
  before_action :require_in_room, only: [:game]
  before_action :require_out_room, only: [:lobby]

  def lobby
    @props = {
      app: 'lobby',
      debug: params[:debug] == 'true' ? true : false,
      authentication: current_user && current_user.auth_info,
      games: Game.all.as_json(only: [:id, :name]),
      rooms: Room.play.as_json(only: [:name], methods: [:join_path]),
    }
    render 'root'
  end

  def game
    @props = {
      app: 'game',
      authentication: current_user && current_user.auth_info,
      debug: params[:debug] == 'true' ? true : false,
      room: @room.as_json(only: [:id, :name, :max_player], methods: [:player_count]),
      game: @room.game.as_json(only: [:id, :name, :module, :start_scale, :game_type]),
    }
    render 'root'
  end

  def dev
    game = Game.find(params[:game_id])
    dev_room = game.dev_room
    return redirect_to '/game', notice: 'You are already in another room' if current_user.room && current_user.room != dev_room
    dev_room.join(current_user) if current_user.room.nil?

    @props = {
      app: 'game',
      authentication: current_user && current_user.auth_info,
      debug: params[:debug] == 'true' ? true : false,
      room: dev_room.as_json(only: [:id, :name, :max_player], methods: [:player_count]),
      game: game.as_json(only: [:id, :name, :module, :start_scale, :game_type]),
      dev_mode: true,
    }
    render 'root'
  end

  def recorder
    @props = {app: 'recorder'}
    render 'root'
  end
end

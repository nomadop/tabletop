class RoomsController < ApplicationController
  protect_from_forgery except: [:create]

  before_action :authenticate_user!, except: [:game_data]
  before_action :require_out_room, only: [:create, :join]
  before_action :require_in_room, only: [:destroy, :leave]

  def game_data
    room = Room.find(params[:id])

    render json: {
      game_object_meta: room.game.game_object_meta,
      game_objects: room.game_objects.as_json(methods: [:player_num, :related_x, :related_y, :related_rotate]),
      decks: room.decks,
      player_areas: room.player_areas,
      messages: room.messages,
    }
  end

  def create
    room = Room.new(game_id: params[:game_id], host: current_user, name: params[:name])

    if room.save
      redirect_to '/game'
    else
      redirect_to root_path, notice: 'Create room failed.'
    end
  end

  def destroy
    return redirect_to '/game', notice: 'You are not host' if current_user != @room.host

    if @room.destroy
      ActionCable.server.broadcast("game@room#{@room.id}", action: :close_room)
      redirect_to root_path
    else
      redirect_to '/game', notice: 'Close room failed.'
    end
  end

  def join
    room = Room.find(params[:id])

    if room.join(current_user)
      ActionCable.server.broadcast("game@room#{room.id}", action: :join_room, user: current_user.auth_info)
      redirect_to '/game'
    else
      redirect_to root_path, notice: 'Join room failed.'
    end
  end

  def leave
    auth_info = current_user.auth_info
    if current_user.update(player: nil)
      ActionCable.server.broadcast("game@room#{@room.id}", action: :leave_room, user: auth_info)
      redirect_to root_path
    else
      redirect_to '/game', notice: 'Leave room failed.'
    end
  end
end

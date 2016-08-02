class RoomsController < ApplicationController
  protect_from_forgery except: [:create]

  before_action :authenticate_user!
  before_action :require_out_room, only: [:create, :join]
  before_action :require_in_room, only: [:destroy, :leave]

  def game_data
    room = Room.find(params[:id])

    render json: {
      game_object_meta: GameObjectMetum.where(game: [room.game, nil]),
      game_objects: room.game_objects.includes(:meta, :room, :player, :markers),
      decks: room.decks,
      player_areas: room.player_areas,
      messages: room.messages.includes(:from, :to).where(to: [current_user, nil]).order(:created_at).last(100),
      players: room.players.as_json(only: :number, include: {user: {only: [], methods: [:username, :avatar_info]}}),
      game_flows: room.game.flows.includes(:flow_actions, :to_transitions).as_json(
        include: [:flow_actions, :to_transitions]
      )
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
    return redirect_to '/game', notice: 'Can not destroy dev room' if @room.dev

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

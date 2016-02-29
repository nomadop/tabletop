class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def require_in_room
    @room = current_user.room
    redirect_to root_path, notice: 'You are not in a room.' if @room.nil?
  end

  def require_out_room
    redirect_to '/game', notice: 'You are already in a room.' unless current_user.room.nil?
  end
end

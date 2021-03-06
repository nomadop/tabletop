class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :configure_permitted_parameters, if: :devise_controller?

  def require_in_room
    @room = current_user.room
    redirect_to root_path, notice: 'You are not in a room.' if @room.nil?
  end

  def require_out_room
    redirect_to '/game', notice: 'You are already in a room.' unless current_user.room.nil?
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:nickname])
    devise_parameter_sanitizer.permit(:account_update, keys: [:nickname, :avatar])
  end
end

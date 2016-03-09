class UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user

  def edit_avatar
  end

  def update_avatar
    if @user.update(user_params)
      redirect_to root_path, notice: 'New avatar was successfully uploaded.'
    else
      render users_edit_avatar_path
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_user
    @user = current_user
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def user_params
    params.require(:user).permit(:nickname, :avatar)
  end
end
class UserSessionsController < Devise::SessionsController
  after_action :after_login, only: :create
  after_action :after_logout, only: :destroy

  def after_login
    cookies.signed[:user_id] = current_user.id
  end

  def after_logout
    cookies.delete(:user_id)
  end
end

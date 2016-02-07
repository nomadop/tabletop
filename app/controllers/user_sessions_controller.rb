class UserSessionsController < Devise::SessionsController
  after_filter :after_login, only: :create
  after_filter :after_logout, only: :destroy

  def after_login
    cookies.signed[:user_id] = current_user.id
  end

  def after_logout
    cookies.delete(:user_id)
  end
end

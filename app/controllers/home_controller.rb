class HomeController < ApplicationController
  before_action :authenticate_user!

  def lobby
    render component: 'Root', props: { app: 'lobby', auth_info: current_user&.auth_info }
  end

  def game
    props = {
      app: 'game',
      auth_info: current_user&.auth_info,
    }
    render component: 'Root', props: props
  end
end

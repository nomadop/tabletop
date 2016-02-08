class HomeController < ApplicationController
  before_action :authenticate_user!

  def lobby
    props = {
      app: 'lobby',
      authentication: current_user && current_user.auth_info,
    }
    render component: 'Root', props: props
  end

  def game
    props = {
      app: 'game',
      authentication: current_user && current_user.auth_info,
      debug: true,
    }
    render component: 'Root', props: props
  end
end

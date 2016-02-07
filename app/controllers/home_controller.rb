class HomeController < ApplicationController
  def lobby
    render component: 'Root', props: { app: 'lobby', auth_info: current_user&.auth_info }
  end
end

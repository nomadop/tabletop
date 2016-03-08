require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Tabletop
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.browserify_rails.commandline_options = '-t babelify'
    config.active_job.queue_adapter = :sidekiq
    config.action_cable.allowed_request_origins = ['http://localhost:300', 'https://192.168.3.4:3000']
    config.force_ssl = true
  end
end

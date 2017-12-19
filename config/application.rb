require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Tabletop
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.active_job.queue_adapter = :sidekiq
    config.action_cable.allowed_request_origins = ['http://localhost:3000', 'https://localhost:3000', 'https://192.168.3.4:3000']
    # config.force_ssl = true
    config.autoload_paths << "#{Rails.root}/app/models/flow_actions"
  end
end

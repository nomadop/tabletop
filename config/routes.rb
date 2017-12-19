require 'sidekiq/web'

Rails.application.routes.draw do
  resources :rooms do
    member do
      get 'game_data'
      post 'join'
      post 'leave'
    end
  end
  resources :games do
    resources :game_object_meta
    resources :game_flows
  end
  devise_for :users, controllers: { sessions: :user_sessions }
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'home#lobby'

  get '/game' => 'home#game'
  get '/dev' => 'home#dev'
  get '/game_object_meta/new' => 'game_object_meta#in_game_new'
  get '/recorder' => 'home#recorder'
  get '/users/edit_avatar' => 'users#edit_avatar'
  put '/users/update_avatar' => 'users#update_avatar'

  # Serve websocket cable requests in-process
  mount ActionCable.server => '/cable'
  mount Sidekiq::Web, at: '/sidekiq'
end

Rails.application.routes.draw do
  resources :rooms do
    member do
      get 'game_data'
      post 'join'
      post 'leave'
    end
  end
  resources :games
  resources :game_object_meta
  devise_for :users, controllers: { sessions: :user_sessions }
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'home#lobby'

  get '/game' => 'home#game'

  # Serve websocket cable requests in-process
  mount ActionCable.server => '/cable'
end

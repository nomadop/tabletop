json.array!(@games) do |game|
  json.extract! game, :id, :name, :module, :start_scale, :max_player, :description
  json.url game_url(game, format: :json)
end

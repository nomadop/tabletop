json.array!(@game_flows) do |game_flow|
  json.extract! game_flow, :id, :game_id, :name, :actions
  json.url game_object_metum_url(game_flow, format: :json)
end

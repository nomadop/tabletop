json.array!(@game_object_meta) do |game_object_metum|
  json.extract! game_object_metum, :id, :name, :sub_type, :front_img, :back_img, :width, :height, :description
  json.url game_object_metum_url(game_object_metum, format: :json)
end

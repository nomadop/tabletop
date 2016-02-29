class AddColumnsToGameObjects < ActiveRecord::Migration[5.0]
  def change
    remove_column :game_objects, :user_id, :integer
    add_column :game_objects, :player_id, :integer
    add_column :game_objects, :room_id, :integer
  end
end

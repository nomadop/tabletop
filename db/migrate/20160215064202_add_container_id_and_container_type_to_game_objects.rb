class AddContainerIdAndContainerTypeToGameObjects < ActiveRecord::Migration[5.0]
  def change
    add_column :game_objects, :container_id, :integer
    add_column :game_objects, :container_type, :string
    add_column :game_objects, :deck_index, :integer
  end
end

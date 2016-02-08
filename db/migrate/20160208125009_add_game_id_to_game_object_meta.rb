class AddGameIdToGameObjectMeta < ActiveRecord::Migration[5.0]
  def change
    add_column :game_object_meta, :game_id, :integer
  end
end

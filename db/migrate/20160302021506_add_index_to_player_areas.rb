class AddIndexToPlayerAreas < ActiveRecord::Migration[5.0]
  def change
    add_index :player_areas, :player_id, unique: true
  end
end

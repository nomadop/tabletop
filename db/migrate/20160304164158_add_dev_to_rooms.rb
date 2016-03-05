class AddDevToRooms < ActiveRecord::Migration[5.0]
  def change
    add_column :rooms, :dev, :boolean
    add_index :rooms, [:game_id, :dev], unique: true
  end
end

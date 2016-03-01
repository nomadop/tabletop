class CreatePlayerAreas < ActiveRecord::Migration[5.0]
  def change
    create_table :player_areas do |t|
      t.integer :room_id
      t.integer :player_id
      t.float :center_x
      t.float :center_y
      t.float :width
      t.float :height
      t.float :rotate

      t.timestamps
    end
  end
end

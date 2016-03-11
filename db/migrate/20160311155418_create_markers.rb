class CreateMarkers < ActiveRecord::Migration[5.0]
  def change
    create_table :markers do |t|
      t.integer :marker_type, null: false
      t.integer :game_object_id, null: false
      t.float :top, default: 0
      t.float :left, default: 0
      t.float :rotate, default: 0
      t.float :scale, default: 1
      t.text :content, default: "--- {}\n"

      t.timestamps
    end
  end
end

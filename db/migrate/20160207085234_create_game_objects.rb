class CreateGameObjects < ActiveRecord::Migration[5.0]
  def change
    create_table :game_objects do |t|
      t.integer :user_id
      t.integer :meta_id, null: false
      t.string :meta_type, null: false
      t.float :center_x, default: 0
      t.float :center_y, default: 0
      t.float :rotate, default: 0
      t.boolean :is_locked, default: false
      t.boolean :is_fliped, default: false
      t.integer :lock_version, default: 0

      t.timestamps
    end
  end
end

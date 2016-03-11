class CreateGames < ActiveRecord::Migration[5.0]
  def change
    create_table :games do |t|
      t.string :name
      t.string :module, null: false
      t.float :start_scale
      t.string :max_player
      t.text :description

      t.timestamps
    end
    add_index :games, :module, unique: true
  end
end

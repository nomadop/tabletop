class CreateRooms < ActiveRecord::Migration[5.0]
  def change
    create_table :rooms do |t|
      t.integer :game_id
      t.integer :host_id
      t.string :name
      t.string :password
      t.integer :max_player, default: 8

      t.timestamps
    end
  end
end

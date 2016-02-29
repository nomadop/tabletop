class CreatePlayers < ActiveRecord::Migration[5.0]
  def change
    create_table :players do |t|
      t.integer :user_id
      t.integer :room_id
      t.integer :number

      t.timestamps
    end
    add_index :players, :user_id, unique: true
    add_index :players, [:room_id, :number], unique: true
  end
end

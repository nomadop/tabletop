class CreateVotes < ActiveRecord::Migration[5.0]
  def change
    create_table :votes do |t|
      t.integer :room_id
      t.integer :status, default: 0
      t.json :options, default: []

      t.timestamps
    end
  end
end

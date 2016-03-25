class CreateGameFlows < ActiveRecord::Migration[5.0]
  def change
    create_table :game_flows do |t|
      t.string :name
      t.integer :game_id
      t.json :actions, default: []

      t.timestamps
    end
  end
end

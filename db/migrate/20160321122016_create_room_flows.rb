class CreateRoomFlows < ActiveRecord::Migration[5.0]
  def change
    create_table :room_flows do |t|
      t.integer :room_id
      t.integer :game_flow_id
      t.string :message

      t.timestamps
    end
  end
end

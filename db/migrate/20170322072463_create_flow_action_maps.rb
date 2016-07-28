class CreateFlowActionMaps < ActiveRecord::Migration[5.0]
  def change
    create_table :flow_action_maps do |t|
      t.integer :game_flow_id
      t.integer :flow_action_id
      t.integer :number
      t.json :arguments

      t.timestamps
    end
  end
end

class CreateFlowTransitions < ActiveRecord::Migration[5.0]
  def change
    create_table :flow_transitions do |t|
      t.integer :from_flow_id
      t.integer :to_flow_id
      t.string :keyword

      t.timestamps
    end
  end
end

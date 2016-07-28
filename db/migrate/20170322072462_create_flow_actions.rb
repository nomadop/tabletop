class CreateFlowActions < ActiveRecord::Migration[5.0]
  def change
    create_table :flow_actions do |t|
      t.string :key
      t.string :name
      t.json :arguments
      t.text :description

      t.timestamps
    end
  end
end

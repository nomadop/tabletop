class AddFlowVersionToRoomFlows < ActiveRecord::Migration[5.0]
  def change
    add_column :room_flows, :flow_version, :integer, default: 0
  end
end

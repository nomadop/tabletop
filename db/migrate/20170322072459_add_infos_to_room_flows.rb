class AddInfosToRoomFlows < ActiveRecord::Migration[5.0]
  def change
    add_column :room_flows, :infos, :json, default: {}
  end
end

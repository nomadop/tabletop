class ExecuteFlowJob < ApplicationJob
  queue_as :default

  def perform(room_flow_id, version)
    flow = RoomFlow.where(id: room_flow_id, flow_version: version).take
    flow.execute(version) if flow
  end
end

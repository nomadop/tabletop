class ExecuteFlowJob < ApplicationJob
  queue_as :default

  def perform(room_flow_id)
    flow = RoomFlow.find(room_flow_id)
    flow.execute
  end
end

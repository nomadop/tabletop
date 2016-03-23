class TransitFlowJob < ApplicationJob
  queue_as :default

  def perform(room_flow_id)
    flow = RoomFlow.find(room_flow_id)
    flow.transit
  end
end

class RoomFlow < ApplicationRecord
  belongs_to :room
  belongs_to :game_flow
  has_many :to_transitions, through: :game_flow

  def execute
    game_flow.instance_variable_set(:@room, room)
    game_flow.execute
  end

  def transit
    fail 'Can not transit end flow' if to_transitions.empty?

    target_transition = nil
    to_transitions.find_each do |transition|
      break target_transition = transition if transition.keyword == message || transition.regexp =~ message
    end

    if target_transition
      update(game_flow: target_transition.to_flow)
      room.flow_log("Transit to #{target_transition.to_flow.name} with keyword #{target_transition.keyword} and message #{message}")
      ExecuteFlowJob.perform_later(id)
    else
      fail "Invalid message `#{message}'"
    end
  end
end

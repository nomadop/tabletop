class RoomFlow < ApplicationRecord
  after_initialize :init_game_flow

  belongs_to :room
  belongs_to :game_flow
  has_many :to_transitions, through: :game_flow

  def execute
    game_flow.execute
  end

  def transit
    target_transition = nil
    to_transitions.find_each do |transition|
      break target_transition = transition if transition.keyword == message || transition.regexp =~ message
    end

    if target_transition
      update(game_flow: target_transition.to_flow)
    else
      fail "Invalid message `#{message}'"
    end
  end

  private

  def init_game_flow
    game_flow.instance_variable_set(:@room, room)
  end
end

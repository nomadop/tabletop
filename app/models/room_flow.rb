class RoomFlow < ApplicationRecord
  belongs_to :room
  belongs_to :game_flow
  has_many :to_transitions, through: :game_flow

  def roles
    infos['roles']
  end

  def add_role(role)
    fail "Invalid role `#{role}' for game `#{room.game.name}'" unless room.game.roles.include?(role)

    infos['roles'] ||= []
    infos['roles'] << role
    save
  end

  def remove_role(role)
    return false unless infos.has_key?('roles') && infos['roles'].is_a?(Array)

    index = infos['roles'].find_index(role)
    return false if index.nil?

    infos['roles'].delete_at(index)
    save
  end

  def execute(version)
    game_flow.instance_variable_set(:@room, room)
    game_flow.instance_variable_set(:@version, version)
    game_flow.execute
  end

  def transit(version)
    fail 'Can not transit end flow' if to_transitions.empty?

    msg = message || ''
    target_transition = nil
    to_transitions.find_each do |transition|
      break target_transition = transition if transition.keyword == msg || transition.regexp =~ msg
    end

    if target_transition
      update(game_flow: target_transition.to_flow)
      room.flow_log("Transit to #{target_transition.to_flow.name} with keyword #{target_transition.keyword} and message #{msg}")
      ExecuteFlowJob.perform_later(id, version)
    else
      fail "Invalid message `#{msg}'"
    end
  end
end

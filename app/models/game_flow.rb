class GameFlow < ApplicationRecord
  belongs_to :game
  has_many :from_transitions, foreign_key: :to_flow_id, class_name: 'FlowTransition'
  has_many :to_transitions, foreign_key: :from_flow_id, class_name: 'FlowTransition'
  has_many :from_flows, through: :from_transitions
  has_many :to_flows, through: :to_transitions
  scope :start_flow, -> do
    joins('LEFT JOIN "flow_transitions" ON "flow_transitions"."to_flow_id" = "game_flows"."id"')
      .group(:id).having('count(flow_transitions.id) = 0')
  end
  scope :end_flow, -> do
    joins('LEFT JOIN "flow_transitions" ON "flow_transitions"."from_flow_id" = "game_flows"."id"')
      .group(:id).having('count(flow_transitions.id) = 0')
  end

  def execute
    fail 'No room specified' unless instance_variable_defined?(:@room)

    actions.each { |action| execute_action(action) }
  end

  def execute_action(action)
    action = action.symbolize_keys
    action_name = action[:name]
    action.delete(:name)
    fail "Unknown action `#{action_name}'" unless private_methods.include?(action_name.to_sym)

    send(action_name, action)
  end

  private

  def transit(wait: 0)
    TransitFlowJob.set(wait: wait.seconds).perform_later(id)
  end

  def send_message(level: 'info', to: nil, content: nil)
    @room.messages.create(level: level, to: to, content: content) if content
  end

  def check_player(player: {}, count: nil)
    fail 'Invalid count' if count.nil?

    players = @room.players
    players = players.where(player['where']) if player['where']
    players = players.where.not(player['not']) if player['not']
    @room.set_flow_message(players.count <=> count)
  end

  def start_player_vote(voter: {}, votee: {})
    voters = @room.players
    voters = voters.where(voter.where) if voter.where
    voters = voters.where.not(voter.not) if voter.not
    votees = @room.players
    votees = votees.where(votee.where) if votee.where
    votees = votees.where.not(votee.not) if votee.not

    @room.start_player_vote(voters, votees)
  end

  def update_players(player: {}, attributes: {})
    players = @room.players
    players = players.where(player.where) if player.where
    players = players.where.not(player.not) if player.not

    players.update_all(attributes)
  end

  def update_player_role(who: nil, role: nil)
    fail 'Invalid count' if count.nil? || role.nil?

    player = if who.is_a?(Fixnum)
               @room.players.where(number: who).take
             else
               @room.players.where(role: who).take
             end
    player.update(role: role)
  end

  def update_player_status(who: nil, status: nil)
    fail 'Invalid count' if count.nil? || status.nil?

    player = if who.is_a?(Fixnum)
               @room.players.where(number: who).take
             else
               @room.players.where(role: who).take
             end
    player.update(status: status)
  end

  def check_vote
    result = @room.vote.result

  end
end

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

  def start_flow?
    from_transitions.empty?
  end

  def end_flow?
    to_transitions.empty?
  end

  def execute
    @room.flow_log("Flow Start: #{name}")
    fail 'No room specified' unless instance_variable_defined?(:@room)

    actions.each { |action| execute_action(action) }
  end

  def execute_action(action)
    @room.flow_log("Action execute: #{action}")
    action = action.symbolize_keys
    action_name = action[:name]
    action.delete(:name)
    fail "Unknown action `#{action_name}'" unless private_methods.include?(action_name.to_sym)

    action.each do |k, v|
      value = v.is_a?(String) ? v.gsub(/`([\w_]+)`/) { send("get_#{$1}") } : v
      action[k] = value
    end
    send(action_name, action)
  end

  private

  def get_message
    @room.flow.message
  end

  def assign_role
    roles = @room.flow.infos['roles']
    roles.shuffle
    @room.players.active.find_each.with_index do |player, index|
      player.update(role: roles[index])
      @room.messages.create(level: :info, to: player.user, content: "你的角色是`#{role}`")
    end
  end

  def transit(wait: 0)
    wait = wait.to_i
    if wait > 0
      TransitFlowJob.set(wait: wait.seconds).perform_later(@room.flow.id)
    else
      TransitFlowJob.perform_now(@room.flow.id)
    end
  end

  def send_message(level: 'info', to: nil, content: nil)
    @room.messages.create(level: level, to: to, content: content) if content
  end

  def check_role(role: nil, count: nil, plus: 0, multiply: 1)
    fail 'Invalid arguments' if role.nil? || count.nil?
    count =
      case count
      when Fixnum then count
      when /^\d+$/ then count.to_i
      when 'active_players' then @room.players.active.count
      else fail "Invalid count `#{count}'"
      end

    roles = @room.flow.infos['roles'] || []
    roles = roles.select { |r| r == role || r =~ Regexp.new(role) }
    @room.set_flow_message(roles.count <=> count * multiply + plus)
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
    voters = voters.where(voter['where']) if voter['where']
    voters = voters.where.not(voter['not']) if voter['not']
    votees = @room.players
    votees = votees.where(votee['where']) if votee['where']
    votees = votees.where.not(votee['not']) if votee['not']

    @room.start_player_vote(voters, votees, default: 'none')
  end

  def update_players(player: {}, attributes: {})
    players = @room.players
    players = players.where(player['where']) if player['where']
    players = players.where.not(player['not']) if player['not']

    players.update_all(attributes)
  end

  def update_player_role(who: nil, role: nil)
    fail 'Invalid parameters' if who.nil? || role.nil?

    player =
      if who.is_a?(Fixnum)
        @room.players.where(number: who).take
      else
        @room.players.where(role: who).take
      end
    player.update(role: role)
  end

  def update_player_status(who: nil, status: nil)
    fail 'Invalid parameters' if who.nil? || status.nil?

    player =
      if who.is_a?(Fixnum) || /\d+/ =~ who
        @room.players.find(who)
      else
        @room.players.where(role: who).take
      end
    player.update(status: status)
  end

  def check_vote(_)
    vote = @room.vote
    fail 'Vote is not open' unless vote.open?

    result = vote.result.to_a.sort_by { |r| r[1] }
    first = result[0]
    second = result[1]

    if !first
      @room.set_flow_message(vote.default)
    elsif !second || first[1] > second[1]
      @room.set_flow_message(first[0] || vote.default)
    else
      equals = result.select { |r| r[1] == first[1] }
      @room.set_flow_message("equals:#{equals.map { |r| r[1] }.to_json}")
    end
    vote.close!
  end

  def charge_dying(_)
    dying_players = @room.players.dying
    dying_players.update_all(status: 1)
  end

  def broadcast_data(to: nil, **data)
    if to
      players = @room.players
      players = players.where(to['where']) if to['where']
      players = players.where.not(to['not']) if to['not']
      players.includes(:user).find_each do |player|
        ActionCable.server.broadcast("game##{player.user.id}", data) if player.user
      end
    else
      ActionCable.server.broadcast("game@room#{@room.id}", data)
    end
  end
end

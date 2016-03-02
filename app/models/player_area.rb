class PlayerArea < ApplicationRecord
  belongs_to :room
  belongs_to :player
  has_many :inner_objects, class_name: 'GameObject', as: :container

  def as_json(opts = {})
    opts[:methods] ||= []
    opts[:methods] |= [:player_num, :username]
    opts[:except] ||= []
    opts[:except] |= [:created_at, :updated_at]
    super(opts)
  end

  def username
    player.user.email if player.user
  end

  def player_num
    player.number
  end
end

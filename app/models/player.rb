class Player < ApplicationRecord
  before_create :generate_number

  belongs_to :user
  belongs_to :room
  has_one :area, class_name: 'PlayerArea'

  scope :available, ->{ where(user: nil) }
  scope :active, ->{ where.not(user: nil) }
  enum role: [:无, :村民, :狼人]
  enum status: [:alive, :dead, :dying]
  enum vote_status: [:open_to_vote, :close_to_vote, :voted]

  def username
    user.username
  end

  def inspect
    "玩家#{number}(#{user.nil? ? '空闲' : user.username})"
  end

  private

  def generate_number
    self.number = room.players.count + 1
  end
end

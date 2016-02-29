class Player < ApplicationRecord
  before_create :generate_number

  belongs_to :user
  belongs_to :room

  scope :available, ->{ where(user: nil) }

  def generate_number
    self.number = room.players.count + 1
  end
end

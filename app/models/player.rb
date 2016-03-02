class Player < ApplicationRecord
  before_create :generate_number

  belongs_to :user
  belongs_to :room
  has_one :area, class_name: 'PlayerArea'

  scope :available, ->{ where(user: nil) }

  private

  def generate_number
    self.number = room.players.count + 1
  end
end

class Vote < ApplicationRecord
  belongs_to :room
  has_many :voters, -> { voted } , through: :room, source: :players

  enum status: [:close, :open]

  def result
    voters.group(:vote).count
  end
end

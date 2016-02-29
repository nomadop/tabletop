class Room < ApplicationRecord
  after_create :create_host_player

  belongs_to :game
  belongs_to :host, class_name: 'User'
  has_many :game_objects, dependent: :destroy
  has_many :decks, dependent: :destroy
  has_many :players, dependent: :destroy
  has_many :users, through: :players

  def create_host_player
    players.create(user: host)
  end
end

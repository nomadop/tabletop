class Room < ApplicationRecord
  include Rails.application.routes.url_helpers

  after_create :create_host_player

  belongs_to :game
  belongs_to :host, class_name: 'User'
  has_many :game_objects, dependent: :destroy
  has_many :decks, dependent: :destroy
  has_many :players, dependent: :destroy
  has_many :users, through: :players
  has_many :player_areas, dependent: :destroy

  def join(user)
    if players.available.any?
      player = players.available.take
      player.with_lock do
        player.user = user
        player.save!
      end
      true
    else
      players.create(user: user) if players.count < max_player
    end
  rescue StandardError => e
    puts e.inspect, e.backtrace
    false
  end

  def join_path
    join_room_path(self)
  end

  def leave_path
    leave_room_path(self)
  end

  def create_host_player
    players.create(user: host)
  end
end

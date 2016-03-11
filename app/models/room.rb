class Room < ApplicationRecord
  include Rails.application.routes.url_helpers

  after_create :create_host_player
  after_create :copy_objects_from_dev

  belongs_to :game
  belongs_to :host, class_name: 'User', optional: true
  has_many :game_objects, dependent: :destroy
  has_many :decks, dependent: :destroy
  has_many :players, dependent: :destroy
  has_many :users, through: :players
  has_many :player_areas, dependent: :destroy
  has_many :messages, dependent: :destroy

  scope :dev, ->{ where(dev: true) }
  scope :play, ->{ where(dev: nil) }

  def player_count
    players.count
  end

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

  private

  def create_host_player
    players.create(user: host)
  end

  def copy_objects_from_dev
    return true if dev

    dev_room = game.dev_room
    deck_map = {}
    dev_room.decks.find_each do |deck|
      d = decks.create(deck.old_as_json(only: [:sub_type, :width, :height]))
      deck_map[deck.id] = d
    end
    dev_room.game_objects.find_each do |object|
      o = game_objects.create(object.old_as_json(only: [:meta_id, :meta_type, :center_x, :center_y, :rotate, :is_fliped, :deck_index]))
      o.meta = deck_map[object.meta_id] if object.meta_type === 'Deck'
      o.container = deck_map[object.container_id] if object.container_id && object.container_type === 'Deck'
    end
    messages.create(level: :info, content: "#{host.username}创建了房间#{name}(#{game.name}).")
  end
end

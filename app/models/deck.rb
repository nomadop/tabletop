class Deck < ApplicationRecord
  before_destroy :resume_inner_objects

  belongs_to :room
  has_one :game_object, as: :meta, dependent: :destroy
  has_many :inner_objects, class_name: 'GameObject', as: :container

  alias_method :old_as_json, :as_json

  def top
    @top ||= inner_objects.order(deck_index: :desc).first
  end

  def reload
    @top = nil
    super
  end

  def front_img
    top && top.meta.front_img
  end

  def back_img
    top && top.meta.back_img
  end

  def count
    inner_objects.count
  end

  def as_json(opts = {})
    opts[:methods] ||= []
    opts[:methods] |= [:front_img, :back_img]
    opts[:except] ||= []
    opts[:except] |= [:created_at, :updated_at]
    super(opts)
  end

  def shuffle
    index = [*(1..inner_objects.count)].shuffle
    GameObject.transaction do
      inner_objects.order(:id).each_with_index { |o, i| o.update(deck_index: index[i]) }
    end
  end

  def draw(player_id: nil, target_id: nil)
    object = target_id.nil? ? top : inner_objects.find(target_id)
    if object
      attrs = game_object
                .old_as_json(only: [:center_x, :center_y, :rotate, :is_fliped])
                .merge(player_id.nil? ? {container: nil} : {container: nil, player_id: player_id, is_locked: true})
      Deck.transaction do
        GameObject.transaction do
          object.update(attrs)
          if is_expanded
            game_object.update(is_fliped: true)
          end
          self.update(is_expanded: false)
        end
      end
    end
    object
  end

  def join(game_objects)
    game_objects = Array(game_objects)
    raise 'Empty targets' if game_objects.empty?
    raise 'Invalid sub type' if game_objects.any? { |obj| obj.sub_type != sub_type }

    deck_index = inner_objects.maximum(:deck_index) || 0
    sync_attrs = [:center_x, :center_y, :rotate, :is_fliped]
    GameObject.transaction do
      game_objects.each.with_index(1) do |deck_object, index|
        attrs = game_object.old_as_json(only: sync_attrs).merge(container: self, deck_index: deck_index + index, is_locked: false)
        deck_object.update(attrs)
      end
    end
    return true
  rescue StandardError => e
    puts e.inspect, e.backtrace
    return true
  end

  def resume_inner_objects
    position = game_object.nil? ?
      {center_x: 0, center_y: 0, rotate: 0} :
      game_object.old_as_json(only: [:center_x, :center_y, :rotate])
    inner_objects.update_all(position.merge(container_id: nil, container_type: nil))
  end

  def self.create_deck(room, game_objects)
    game_objects = Array(game_objects)
    raise 'Invalid game object meta' if game_objects.map(&:meta_type).uniq != ['GameObjectMetum']
    raise 'Can not pack multiple sub type' if game_objects.map(&:sub_type).uniq.size > 1

    deck = nil
    meta = game_objects.first.meta
    Deck.transaction do
      GameObject.transaction do
        deck = room.decks.create(meta.as_json(only: [:sub_type, :width, :height]))
        center_x = game_objects.map(&:center_x).sum / game_objects.size
        center_y = game_objects.map(&:center_y).sum / game_objects.size
        deck.create_game_object(room: room, center_x: center_x, center_y: center_y, is_fliped: true)
        deck.join(game_objects)
      end
    end
    deck
  end
end

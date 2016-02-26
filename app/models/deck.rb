class Deck < ApplicationRecord
  before_destroy :resume_inner_objects

  has_one :game_object, as: :meta, dependent: :destroy
  has_many :inner_objects, class_name: 'GameObject', as: :container

  def top
    @top ||= inner_objects.order(:deck_index).first
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
    opts[:methods] |= [:front_img, :back_img, :count]
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

  def draw(user_id: nil, target_id: nil)
    object = target_id.nil? ? top : inner_objects.find(target_id)
    if object
      attrs = game_object
                .as_json(only: [:center_x, :center_y, :rotate, :is_fliped])
                .merge(user_id.nil? ? {container_id: nil} : {container_id: 0, user_id: user_id, is_locked: true})
      object.update(attrs)
    end
    object
  end

  def join(game_objects)
    game_objects = Array(game_objects)
    return false if game_objects.empty?
    return false if game_objects.any? { |obj| obj.sub_type != sub_type }

    deck_count = inner_objects.count
    sync_attrs = [:center_x, :center_y, :rotate, :is_fliped]
    GameObject.transaction do
      game_objects.each.with_index(1) do |deck_object, index|
        attrs = game_object.as_json(only: sync_attrs).merge(container: self, deck_index: deck_count + index, is_locked: false)
        deck_object.update(attrs)
      end
    end
    return true
  rescue StandardError => e
    return false
  end

  def resume_inner_objects
    position = game_object.as_json(only: [:center_x, :center_y, :rotate])
    inner_objects.update_all(position.merge(container_id: nil, container_type: nil))
  end

  def self.create_deck(game_objects)
    game_objects = Array(game_objects)
    return nil if game_objects.map(&:meta_type).uniq != ['GameObjectMetum']
    return nil if game_objects.map(&:sub_type).uniq.size > 1

    meta = game_objects.first.meta
    deck = Deck.create(meta.as_json(only: [:sub_type, :width, :height]))

    GameObject.transaction do
      center_x = game_objects.map(&:center_x).sum / game_objects.size
      center_y = game_objects.map(&:center_y).sum / game_objects.size
      deck.create_game_object(center_x: center_x, center_y: center_y, is_fliped: true)
      deck.join(game_objects)
    end
    deck
  end
end

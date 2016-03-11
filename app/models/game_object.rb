class GameObject < ApplicationRecord
  SERIALIZE_KEYS = %w(id meta_id meta_type container_id container_type center_x center_y related_x related_y related_rotate rotate is_fliped is_locked lock_version player_num)
  META_TYPES = %w(GameObjectMetum Deck)

  before_save :round_position
  before_save :check_container

  alias_method :old_as_json, :as_json

  belongs_to :room
  belongs_to :player, optional: true
  belongs_to :meta, polymorphic: true
  belongs_to :container, polymorphic: true, optional: true
  has_many :markers, dependent: :destroy

  def as_json(opts = {})
    opts[:except] ||= []
    opts[:except] |= [:room_id, :player_id, :deck_index, :created_at, :updated_at]
    super(opts)
  end

  def player_num
    player.number if player
  end

  def sub_type
    meta.sub_type
  end

  def inner_object?
    container_id && container_type != 'Deck'
  end

  def related_postion
    @inner_position ||= container.rotate_by_center([center_x, center_y]) if inner_object?
  end

  def related_x
    related_postion[0] - container.left_x if inner_object?
  end

  def related_y
    related_postion[1] - container.top_y if inner_object?
  end

  def related_rotate
    rotate - container.rotate if inner_object?
  end

  def left_x
    center_x - width / 2
  end

  def right_x
    center_x + width / 2
  end

  def top_y
    center_y - height / 2
  end

  def bottom_y
    center_y + height / 2
  end

  def require_lock(player)
    return player_id == player.id if is_locked

    update(is_locked: true, player: player)
  end

  def release_lock
    update(is_locked: false, player_id: nil)
  end

  def self.serialize_game_object(serialize_keys, object)
    keys = serialize_keys || SERIALIZE_KEYS
    attrs = keys.map do |key|
      attr = object.send(key)
      if key == 'meta_type'
        META_TYPES.index(attr)
      elsif attr.is_a?(TrueClass)
        't'
      elsif attr.is_a?(FalseClass)
        'f'
      else
        attr
      end
    end
    attrs.join(',')
  end

  def self.unserialize_game_object(serialize_keys, serial)
    keys = serialize_keys || SERIALIZE_KEYS
    result = {}
    excludes = %w(related_x related_y player_num)
    serial.split(',').each_with_index do |attr, index|
      next if attr.blank?

      attr_name = keys[index]
      next if excludes.include?(attr_name)

      result[attr_name] = attr == 'n' ? nil : attr
    end
    result
  end

  private

  def round_position
    self.center_x = center_x.round(3)
    self.center_y = center_y.round(3)
  end

  def check_container
    return true unless inner_object?

    if container.point_inside?(related_postion)
      self.rotate = container.rotate
    else
      self.container = nil
    end
    true
  end
end

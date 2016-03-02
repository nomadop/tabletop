class GameObject < ApplicationRecord
  SERIALIZE_KEYS = %w(id meta_id meta_type container_id container_type center_x center_y related_x related_y rotate is_fliped is_locked
                      lock_version player_num)

  before_save :round_position
  before_save :check_container

  belongs_to :room
  belongs_to :player, optional: true
  belongs_to :meta, polymorphic: true
  belongs_to :container, polymorphic: true, optional: true

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

  def related_x
    center_x - container.left_x if container_id && container_type != 'Deck'
  end

  def related_y
    center_y - container.top_y if container_id && container_type != 'Deck'
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

  def require_lock(pid)
    return player_id == pid if is_locked

    update(is_locked: true, player_id: pid)
  end

  def release_lock
    update(is_locked: false, player_id: nil)
  end

  def self.serialize_game_object(object)
    SERIALIZE_KEYS.map { |key| object.send(key) }.join(',')
  end

  def self.unserialize_game_object(serial)
    result = {}
    excludes = %w(related_x related_y player_num)
    serial.split(',').each_with_index do |attr, index|
      next if attr.blank?

      attr_name = SERIALIZE_KEYS[index]
      next if excludes.include?(attr_name)

      result[attr_name] = attr == 'null' ? nil : attr
    end
    result
  end

  private

  def round_position
    self.center_x = center_x.round(3)
    self.center_y = center_y.round(3)
  end

  def check_container
    return true if container_id.nil? || container_type == 'Deck'

    self.container = nil unless container.range_x.include?(center_x) && container.range_y.include?(center_y)
  end
end

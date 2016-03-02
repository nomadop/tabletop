class PlayerArea < ApplicationRecord
  after_create :include_game_objects
  after_destroy :resume_game_objects

  belongs_to :room
  belongs_to :player
  has_many :inner_objects, class_name: 'GameObject', as: :container

  def as_json(opts = {})
    opts[:methods] ||= []
    opts[:methods] |= [:player_num, :username]
    opts[:except] ||= []
    opts[:except] |= [:created_at, :updated_at]
    super(opts)
  end

  def range_x
    (left_x..right_x)
  end

  def range_y
    (top_y..bottom_y)
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

  def username
    player.user.email if player.user
  end

  def player_num
    player.number
  end

  private

  def include_game_objects
    GameObject
      .where(center_x: range_x, center_y: range_y, room: room, container: nil, is_locked: false)
      .update_all(container_id: self.id, container_type: self.class.name)
  end

  def resume_game_objects
    inner_objects.update_all(container_id: nil, container_type: nil)
  end
end

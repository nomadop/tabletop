class PlayerArea < ApplicationRecord
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

  def multiply(p1, p2, p0)
    (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1])
  end

  def point_inside?(point)
    multiply(point, left_top, right_top) * multiply(point, left_bottom, right_bottom) <= 0 &&
      multiply(point, left_bottom, left_top) * multiply(point, right_bottom, right_top) <= 0
  end

  def rotate_by_center(point)
    rad = Math::PI * -rotate / 180
    cos = Math.cos(rad)
    sin = Math.sin(rad)

    target_x, target_y = point
    rotate_x, rotate_y = center_x, center_y
    result_x = (target_x - rotate_x) * cos - (target_y - rotate_y) * sin + rotate_x
    result_y = (target_x - rotate_x) * sin + (target_y - rotate_y) * cos + rotate_y
    [result_x, result_y]
  end

  def left_top
    [left_x, top_y]
  end

  def left_bottom
    [left_x, bottom_y]
  end

  def right_top
    [right_x, top_y]
  end

  def right_bottom
    [right_x, bottom_y]
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

  def resume_game_objects
    inner_objects.update_all(container_id: nil, container_type: nil)
  end
end

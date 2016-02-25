class GameObject < ApplicationRecord
  before_save :round_position

  belongs_to :meta, polymorphic: true
  belongs_to :container, polymorphic: true, optional: true

  def as_json(opts = {})
    opts[:except] ||= []
    opts[:except] << :deck_index << :created_at << :updated_at
    super(opts)
  end

  def sub_type
    meta.sub_type
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

  def require_lock(uid)
    return user_id == uid if is_locked

    update(is_locked: true, user_id: uid)
  end

  def release_lock
    update(is_locked: false, user_id: nil)
  end

  private

  def round_position
    self.center_x = center_x.round(3)
    self.center_y = center_y.round(3)
  end
end

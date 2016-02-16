class GameObject < ApplicationRecord
  belongs_to :meta, polymorphic: true
  belongs_to :container, polymorphic: true, optional: true

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
end

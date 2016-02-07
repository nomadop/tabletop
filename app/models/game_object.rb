class GameObject < ApplicationRecord
  belongs_to :meta, polymorphic: true

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

  def as_json(opts = {})
    opts[:methods] ||= []
    opts[:methods] += [:sub_type, :width, :height]
    super(opts)
  end

  def require_lock(uid)
    return user_id == uid if is_locked

    update(is_locked: true, user_id: uid)
  end

  def release_lock
    update(is_locked: false, user_id: nil)
  end

  def method_missing(method, *args, &block)
    meta.respond_to?(method) ? meta.send(method, *args, &block) : super
  end
end

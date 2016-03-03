class Message < ApplicationRecord
  after_create :publish

  belongs_to :room
  belongs_to :from, class_name: 'User', optional: true
  belongs_to :to, class_name: 'User', optional: true

  def as_json(opts = {})
    opts[:methods] ||= []
    opts[:methods] |= [:from_name]
    opts[:except] ||= []
    opts[:except] |= [:created_at, :updated_at]
    super(opts)
  end

  def from_name
    from.nil? ? 'System' : from.email;
  end

  def room_stream
    "game@room#{room_id}"
  end

  def to_user_stream
    "game##{to_id}"
  end

  def stream
    to.nil? ? room_stream : to_user_stream
  end

  private

  def publish
    ActionCable.server.broadcast(stream, action: :new_message, message: self)
  end
end

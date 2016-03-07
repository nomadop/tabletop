class Message < ApplicationRecord
  after_create :publish

  enum msg_type: [ :text, :audio ]
  mount_uploader :mp3, AudioUploader

  belongs_to :room
  belongs_to :from, class_name: 'User', optional: true
  belongs_to :to, class_name: 'User', optional: true

  def as_json(opts = {})
    opts[:methods] ||= []
    opts[:methods] |= [:from_name]
    opts[:except] ||= []
    opts[:except] |= [:room_id, :from_id, :to_id, :created_at, :updated_at]
    super(opts)
  end

  def from_name
    from.nil? ? '系统' : from.username;
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
    ActionCable.server.broadcast(stream, action: :new_message, message: self) if text?
  end
end

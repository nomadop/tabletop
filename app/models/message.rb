class Message < ApplicationRecord
  after_create :publish_text
  after_create :encode_voice

  enum msg_type: [ :text, :audio ]
  mount_uploader :mp3, AudioUploader

  belongs_to :room
  belongs_to :from, class_name: 'User', optional: true
  belongs_to :to, class_name: 'User', optional: true

  def as_json(opts = {})
    opts[:methods] ||= []
    opts[:methods] |= [:from_name, :from_avatar, :from_player]
    opts[:except] ||= []
    opts[:except] |= [:room_id, :from_id, :to_id, :created_at, :updated_at]
    super(opts)
  end

  def level_name
    case level.to_s
    when 'warning'
      '警告'
    when 'error'
      '错误'
    else
      '信息'
    end
  end

  def from_name
    from.nil? ? "系统#{level_name}" : from.username;
  end

  def from_avatar
    from.nil? ? AvatarUploader.anonymous.thumb.url : from.avatar_info.thumb.url
  end

  def from_player
    from.nil? ? nil : from.player_num;
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

  def publish
    ActionCable.server.broadcast(stream, action: :new_message, message: self)
  end

  private

  def publish_text
    publish if text?
  end

  def encode_voice
    EncodeVoiceJob.perform_later(id) if audio?
  end
end

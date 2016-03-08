class EncodeVoiceJob < ApplicationJob
  queue_as :default

  def perform(msg_id)
    msg = Message.find(msg_id)
    return unless msg.audio?

    mp3_path = msg.mp3.file.path
    `lame -V 8 --vbr-new -h -q 0 #{mp3_path} #{mp3_path}.temp`
    `mv -f #{mp3_path}.temp #{mp3_path}`
  end
end

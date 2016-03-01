class PlayerArea < ApplicationRecord
  belongs_to :room
  belongs_to :player
  has_many :inner_objects, class_name: 'GameObject', as: :container

  def player_num
    player.number
  end
end

class User < ApplicationRecord
  has_one :player
  has_one :room, through: :player

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  def room_id
    room.nil? ? 'lobby' : "room#{room.id}"
  end

  def player_id
    player.id if player
  end

  def player_num
    player.number if player
  end

  def auth_info
    as_json(only: :email, methods: :player_num)
  end
end

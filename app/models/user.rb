class User < ApplicationRecord
  has_one :player
  has_one :room, through: :player

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  def player_id
    player.id if player
  end

  def auth_info
    as_json(only: :email, methods: :player_id)
  end
end

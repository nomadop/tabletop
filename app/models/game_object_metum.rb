class GameObjectMetum < ApplicationRecord
  belongs_to :game
  has_many :game_object, as: :meta, dependent: :destroy
end

class GameObjectMetum < ApplicationRecord
  belongs_to :game
  has_many :game_objects, as: :meta, dependent: :destroy
end

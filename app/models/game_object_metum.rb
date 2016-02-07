class GameObjectMetum < ApplicationRecord
  has_many :game_object, as: :meta, dependent: :destroy
end

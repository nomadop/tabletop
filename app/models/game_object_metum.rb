class GameObjectMetum < ApplicationRecord
  belongs_to :game
  has_many :game_objects, as: :meta, dependent: :destroy

  def as_json(opts = {})
    opts[:except] ||= []
    opts[:except] |= [:created_at, :updated_at]
    super(opts)
  end
end

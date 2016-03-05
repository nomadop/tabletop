require 'carrierwave/orm/activerecord'

class GameObjectMetum < ApplicationRecord
  belongs_to :game
  has_many :game_objects, as: :meta, dependent: :destroy

  mount_uploader :front_img, GameResUploader
  mount_uploader :back_img, GameResUploader

  def as_json(opts = {})
    opts[:except] ||= []
    opts[:except] |= [:created_at, :updated_at]
    super(opts)
  end
end

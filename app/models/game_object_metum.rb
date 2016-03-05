require 'carrierwave/orm/activerecord'

class GameObjectMetum < ApplicationRecord
  belongs_to :game
  has_many :game_objects, as: :meta, dependent: :destroy

  validates_presence_of :front_img, :back_img

  mount_uploader :front_img, GameResUploader
  mount_uploader :back_img, GameResUploader
  skip_callback :commit, :after, :remove_front_img!
  skip_callback :commit, :after, :remove_previously_stored_front_img
  skip_callback :commit, :after, :remove_back_img!
  skip_callback :commit, :after, :remove_previously_stored_back_img


  def as_json(opts = {})
    opts[:except] ||= []
    opts[:except] |= [:created_at, :updated_at]
    super(opts)
  end

  def dev_room
    game.dev_room
  end

  def stream
    "game@room#{dev_room.id}"
  end
end

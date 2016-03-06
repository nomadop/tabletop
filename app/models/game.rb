class Game < ApplicationRecord
  after_create :create_dev_room

  has_many :game_object_meta, dependent: :destroy
  has_many :rooms, dependent: :destroy

  def dev_room
    rooms.dev.take
  end

  private

  def create_dev_room
    rooms.create(name: 'dev bhoth', dev: true)
  end
end

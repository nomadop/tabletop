class Game < ApplicationRecord
  after_create :setup

  has_many :game_object_meta, dependent: :destroy

  private

  def setup
    meta_path = Rails.root.join('config', 'meta', 'poker.yml')
    meta = YAML.load(File.read(meta_path))
    game_object_meta.destroy_all
    game_object_meta.create(meta)
  end
end

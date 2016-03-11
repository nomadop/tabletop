class Game < ApplicationRecord
  after_create :create_dev_room

  has_many :game_object_meta, dependent: :destroy
  has_many :rooms, dependent: :destroy

  validates :module, uniqueness: true, presence: true

  def dev_room
    rooms.dev.take
  end

  def export
    file = File.open(Rails.root.join('exports', "#{self.module}.yml"), 'w')
    export = {
      game: self.as_json(except: [:id, :created_at, :updated_at]),
      meta: game_object_meta.as_json(except: [:id, :game_id, :created_at, :updated_at]).map do |metum|
        metum['front_img'] = metum['front_img'].file.filename
        metum['back_img'] = metum['back_img'].file.filename
        metum
      end,
    }
    file.write(export.to_yaml)
    file.close
  end

  def self.import(file)
    import = YAML.load(file)
    game = Game.new(import[:game])
    GameObjectMetum.transaction do
      begin
        file_handler = []
        game.game_object_meta.create(import[:meta].map do |metum|
          front_img_file = File.open(Rails.root.join('public', 'res', game.module, metum['sub_type'], metum['front_img']))
          back_img_file = File.open(Rails.root.join('public', 'res', game.module, metum['sub_type'], metum['back_img']))
          file_handler << front_img_file << back_img_file
          metum['front_img'] = front_img_file
          metum['back_img'] = back_img_file
          metum
        end)
      ensure
        file_handler.map(&:close)
      end
    end if game.save
    game
  end

  private

  def create_dev_room
    rooms.create(name: "dev #{self.module}", dev: true)
  end
end

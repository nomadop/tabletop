class AddGameTypeToGames < ActiveRecord::Migration[5.0]
  def change
    add_column :games, :game_type, :integer, default: 0
  end
end

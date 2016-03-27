class AddRolesToGames < ActiveRecord::Migration[5.0]
  def change
    add_column :games, :roles, :json, default: []
  end
end

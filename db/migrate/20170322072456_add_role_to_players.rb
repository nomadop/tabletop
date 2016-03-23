class AddRoleToPlayers < ActiveRecord::Migration[5.0]
  def change
    add_column :players, :role, :integer, default: 0
    add_column :players, :status, :integer, default: 0
  end
end

class AddVoteStatusToPlayers < ActiveRecord::Migration[5.0]
  def change
    add_column :players, :vote_status, :integer
    add_column :players, :vote, :string
  end
end

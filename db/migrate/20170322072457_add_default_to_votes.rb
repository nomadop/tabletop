class AddDefaultToVotes < ActiveRecord::Migration[5.0]
  def change
    add_column :votes, :default, :string
  end
end

class AddMp3ToMessages < ActiveRecord::Migration[5.0]
  def change
    add_column :messages, :mp3, :string
  end
end

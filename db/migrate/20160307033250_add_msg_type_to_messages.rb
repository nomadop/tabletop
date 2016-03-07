class AddMsgTypeToMessages < ActiveRecord::Migration[5.0]
  def change
    add_column :messages, :msg_type, :integer, default: 0
  end
end

class FlowActionMap < ApplicationRecord
  belongs_to :game_flow
  belongs_to :flow_action

  default_scope -> { order(:number) }
end

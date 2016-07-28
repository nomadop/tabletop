class FlowAction < ApplicationRecord
  has_many :flow_action_maps, dependent: :destroy
end

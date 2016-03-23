class FlowTransition < ApplicationRecord
  belongs_to :from_flow, class_name: 'GameFlow'
  belongs_to :to_flow, class_name: 'GameFlow'

  def regexp
    Regexp.new(keyword)
  end
end

class Marker < ApplicationRecord
  validate :validate_content

  belongs_to :game_object
  serialize :content
  enum marker_type: [ :text, :rect, :meta, :image ]

  def meta
    GameObjectMetum.find(content[:meta_id]) if meta?
  end

  def text
    content[:text] if text?
  end

  private

  def validate_content
    unless content.is_a?(Hash)
      errors.add(:content, '内容错误')
      return
    end

    content.symbolize_keys!
    case marker_type
    when 'text'
      errors.add(:content, '缺少文本') unless content[:text]
      errors.add(:content, '文本类型错误') unless content[:text].is_a?(String)
      errors.add(:content, '文本不能为空') if content[:text].blank?
    when 'rect'
      errors.add(:content, '缺少宽度') unless content[:width]
      errors.add(:content, '缺少高度') unless content[:height]
      errors.add(:content, '缺少粗细') unless content[:weight]
    when 'meta'
      errors.add(:content, '缺少元物件') unless content[:meta_id]
      errors.add(:content, '找不到元物件') unless GameObjectMetum.where(id: content[:meta_id]).exists?
    when 'image'
      errors.add(:content, '缺少数据源') unless content[:src]
      errors.add(:content, '缺少宽度') unless content[:width]
      errors.add(:content, '缺少高度') unless content[:height]
    else
      errors.add(:marker_type, '未知类型')
    end
  end
end

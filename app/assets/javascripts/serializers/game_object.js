const SERIALIZE_KEYS = ['id', 'meta_id', 'meta_type', 'container_id', 'container_type', 'center_x', 'center_y', 'related_x', 'related_y', 'rotate', 'is_fliped', 'is_locked', 'lock_version', 'player_num'];

export function serializeGameObject(gameObject) {
  const attrs = SERIALIZE_KEYS.map(key => {
    const attr = gameObject[key];

    if (attr && (key === 'center_x' || key === 'center_y')) {
      return attr.toFixed(3);
    }

    if ((key === 'container_id' || key === 'container_type') && attr === null) {
      return 'null';
    }

    return attr;
  });

  return attrs.join(',');
}

export function unserializeGameObject(serial) {
  const attrs = serial.split(',');
  const object = {};
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    const key = SERIALIZE_KEYS[i];
    if (/^-?\d+(.\d+)?$/.test(attr)) {
      object[key] = Number(attr);
    } else if (attr === 'true') {
      object[key] = true;
    } else if (attr === 'false') {
      object[key] = false;
    } else if (attr.length > 0) {
      object[key] = attr;
    } else {
      object[key] = null;
    }
  }

  return object;
}
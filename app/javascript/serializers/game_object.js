const SERIALIZE_KEYS = ['id', 'meta_id', 'meta_type', 'container_id', 'container_type', 'center_x', 'center_y', 'related_x', 'related_y', 'related_rotate', 'rotate', 'is_fliped', 'is_locked', 'lock_version', 'player_num'];
const META_TYPES = ['GameObjectMetum', 'Deck'];

export function serializeGameObject(serializeKeys, gameObject) {
  const keys = serializeKeys || SERIALIZE_KEYS;
  const attrs = keys.map(key => {
    const attr = gameObject[key];

    if (attr && (key === 'center_x' || key === 'center_y')) {
      return attr.toFixed(3);
    }

    if ((key === 'container_id' || key === 'container_type') && attr === null) {
      return 'n';
    }

    return attr;
  });

  return attrs.join(',');
}

export function unserializeGameObject(serializeKeys, serial) {
  const keys = serializeKeys || SERIALIZE_KEYS;
  const attrs = serial.split(',');
  const object = {};
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    const key = keys[i];
    if (key === 'meta_type') {
      object[key] = META_TYPES[Number(attr)];
    } else if (/^-?\d+(.\d+)?$/.test(attr)) {
      object[key] = Number(attr);
    } else if (attr === 't') {
      object[key] = true;
    } else if (attr === 'f') {
      object[key] = false;
    } else if (attr.length > 0) {
      object[key] = attr;
    } else {
      object[key] = null;
    }
  }

  return object;
}
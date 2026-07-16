export function checkEventTimeWindow(event) {
  const now = new Date();
  const startsAt = new Date(event.starts_at);
  const endsAt = new Date(event.ends_at);

  if (now < startsAt) {
    const diff = startsAt - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      isOpen: false,
      status: 'upcoming',
      message: `Access opens in ${hours}h ${minutes}m`,
      startsAt,
      endsAt,
    };
  }

  if (now > endsAt) {
    return {
      isOpen: false,
      status: 'expired',
      message: 'This event has ended',
      startsAt,
      endsAt,
    };
  }

  return {
    isOpen: true,
    status: 'active',
    message: 'Event is live',
    startsAt,
    endsAt,
  };
}

export function generateRandomString(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function generateSlug(name, date) {
  const namePart = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 30);

  const datePart = new Date(date).toISOString().slice(5, 10).replace('-', '');
  const rand = generateRandomString(4);

  return `${namePart}-${datePart}-${rand}`;
}

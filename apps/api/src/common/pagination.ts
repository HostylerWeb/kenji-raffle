export function paginate(page = 1, limit = 20, maxLimit = 100) {
  const take = Math.min(Math.max(limit, 1), maxLimit);
  const skip = (Math.max(page, 1) - 1) * take;
  return { take, skip, page: Math.max(page, 1), limit: take };
}

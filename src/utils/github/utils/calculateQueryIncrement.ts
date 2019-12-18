function calculateQueryIncrement(
  recordsInCollection: number,
  totalCount: number,
  maxIncrement: number,
) {
  let queryIncrement = maxIncrement;
  if (totalCount === recordsInCollection) {
    queryIncrement = 0;
  } else if (totalCount - recordsInCollection <= maxIncrement) {
    queryIncrement = totalCount - recordsInCollection;
  }
  return queryIncrement;
}
export default calculateQueryIncrement;

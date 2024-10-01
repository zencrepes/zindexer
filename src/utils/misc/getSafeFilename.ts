/*
    Returns a filename containing only allowed characters
*/
export const getSafeFilename = (string: string) => {
  return String(string)
    .replace(/[^a-z0-9.\-_]+/gi, '')
    .toLowerCase();
};

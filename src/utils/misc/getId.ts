/*
    Returns an id by making the string lowercase and stripping all non alphanumerical characters 
*/
export const getId = (string: string) => {
  return String(string)
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

export const fatalEnum = {
  UNEXPECTED: 0,
  FIRESTORE_ERROR: 1,
  PEER_HOST_FIREWALL: 2,
  HOST_DISCONNECTED: 3,
  ROOM_FULL: 4,
  NO_SUCH_ROOM: 5,
};

export const fatalMsg = {
  [fatalEnum.UNEXPECTED]: "Totally unexpected error occurred.",
  [fatalEnum.FIRESTORE_ERROR]: "Our database is having issues. Please check back later.",
  [fatalEnum.PEER_HOST_FIREWALL]: "A firewall is blocking your connection to the room host.",
  [fatalEnum.HOST_DISCONNECTED]: "You have lost the connection with the room host.",
  [fatalEnum.ROOM_FULL]: "Room is full at the moment. Please check back later.",
  [fatalEnum.NO_SUCH_ROOM]: "Room doesn't seem to exist. Please check your invitation.",
};

export function fatal(error: number) {
  window.location.hash = `/error/${error}`;
  window.location.reload();
}

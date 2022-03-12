const localStorageControllerIdKey = "ue5-bike-controllerId";

function getControllerId(): string {
  const existingControllerId = localStorage.getItem(
    localStorageControllerIdKey
  );
  if (existingControllerId) {
    return existingControllerId;
  }

  const newControllerId =
    Math.random().toString(36).split(".")[1] +
    Math.random().toString(36).split(".")[1];
  localStorage.setItem(localStorageControllerIdKey, newControllerId);
  return newControllerId;
}

export const controllerId = getControllerId();

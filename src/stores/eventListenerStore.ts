/**
 * This function adds a keydown listener and calls your callback function.
 * It returns a cleanup function that you should call whenever your component goes out of scope :)
 * @param callback
 * @returns cleanupFunction
 */
export function addKeyDownListener(callback: (event: KeyboardEvent) => void): () => void {
  document.addEventListener('keydown', callback)

  function cleanup() {
    document.removeEventListener('keydown', callback)
  }

  return cleanup
}

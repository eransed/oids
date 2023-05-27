
/**
 * This function adds a keydown listener and calls your callback function.
 * It returns a cleanup function that you should call whenever your component goes out of scope :)
 * @param callback 
 * @returns cleanupFunction
 */
export function addEventListener_test(callback: (event: KeyboardEvent) => void): () => void {

  document.addEventListener("keydown", callback)
  console.log ("add key listener")

  function cleanup() {
    document.removeEventListener("keydown", callback)
    console.log ("cleanup")
  }

  return cleanup
}

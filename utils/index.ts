/**
 * Formats the data into an array of arrays,
 * specifically for the display on the frontend
 */
export const formatData = (result: { [index: string]: string }): string[][] => {
  const formattedResult = []

  for (const [key, value] of Object.entries(result)) {
    formattedResult.push([prettifyKey(key), value])
  }

  return formattedResult
}

/**
 * Converts a key string from dot-delimited into uppercase
 * for frontend display
 */
export const prettifyKey = (key: string): string => {
  let prettified = key.split('.')[1]
  prettified = prettified.replace(/_/g, ' ')
  return prettified.toUpperCase()
}

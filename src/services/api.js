export async function apiRequest(path, options = {}) {
  let response
  const isFormData = options.body instanceof FormData
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Cannot reach the blog API. Check that the server is running and MongoDB is configured.')
  }

  if (response.status === 204) {
    return null
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('The blog API returned an invalid response. Check the API and MongoDB connection.')
  }
  if (!response.ok) {
    throw new Error(data.error || 'The request could not be completed.')
  }

  return data
}

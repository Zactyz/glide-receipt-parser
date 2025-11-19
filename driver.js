window.addEventListener("message", async function(event) {
  console.log('[Receipt Parser Driver] Message received:', event.data);
  const { origin, data: { key, params } } = event;
  let result;
  let error;
  try {
    console.log('[Receipt Parser Driver] Calling function with params:', params);
    result = await window.function(...params);
    console.log('[Receipt Parser Driver] Function returned:', result);
  } catch (e) {
    console.error('[Receipt Parser Driver] Function error:', e);
    result = undefined;
    try {
      error = e.toString();
    } catch (e) {
      error = "Exception can't be stringified.";
    }
  }
  const response = { key };
  if (result !== undefined) {
    response.result = { type: "object", value: result };
  }
  if (error !== undefined) {
    response.error = error;
  }
  console.log('[Receipt Parser Driver] Sending response:', response);
  event.source.postMessage(response, "*");
});


export async function onRequestGet() {
  return new Response(JSON.stringify({ live: false }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

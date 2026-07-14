import sharp from 'sharp';

const url = 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=VdpVmqTuofrE4zuRVRZrzg&cb_client=search.gws-prod.gps&w=408&h=240&yaw=279.98492&pitch=0&thumbfov=100';

async function main() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
      },
    });
    console.log('status', res.status, 'content-type', res.headers.get('content-type'));
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log('downloaded bytes', buf.length);
      const meta = await sharp(buf).metadata();
      console.log('format', meta.format, 'size', meta.width, meta.height);
    } else {
      const text = await res.text();
      console.log('body', text.slice(0, 200));
    }
  } catch (err) {
    console.error(err);
  }
}
main();

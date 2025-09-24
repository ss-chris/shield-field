import { serve } from '@hono/node-server'
import { app } from './app'
import { hc } from 'hono/client';

const client = hc<typeof app>("");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args);

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on :${info.port}`)
})
